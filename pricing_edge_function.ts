import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingData, amount: manualAmount, promoCode: passedPromo, gasPrices: passedGasPrices } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let finalAmount = 0
    let debugData: any = {}

    if (bookingData) {
      // 1. Fetch Config & Service Prices
      const { data: configData } = await supabase.from('pricing_config').select('id, value')
      const cfg: Record<string, any> = {}
      configData?.forEach((r: any) => { cfg[r.id] = r.value })

      const { data: servicesData } = await supabase.from('services').select('id, price')
      const servicePrices: Record<string, number> = {}
      servicesData?.forEach((s: any) => { servicePrices[s.id] = s.price })

      // 2. Constants & Helpers (Ported from usePricing.js)
      const gasPrices: Record<string, number> = passedGasPrices || { 
          'Regular (87 Octane)': 350, 
          'Mid-Grade (89 Octane)': 390, 
          'Premium (91-93 Octane)': 430, 
          'Diesel': 410 
      } 

      // SURGE REMOVED: Always returns 1.0 per user request
      const getSurgeMultiplier = (dateTimeStr: string, cfg: Record<string, any>) => {
        return 1.0;
      };

      const getTaxRate = (location: string) => {
          if (!location) return (cfg.tax_rate_ga ?? 7.50) / 100
          const loc = location.toUpperCase()
          if (loc.includes('TX') || loc.includes('TEXAS')) return (cfg.tax_rate_tx ?? 8.25) / 100
          return (cfg.tax_rate_ga ?? 7.50) / 100
      }

      const getServicePrice = (serviceName: string, details: any = {}) => {
          let price = 0
          const vTypeRaw = details.vehicleType || (details.isSemiTruck ? 'Semi Truck' : 'Sedan')
          const vType = vTypeRaw.toLowerCase().replace(/ /g, '_')

          if (serviceName === 'Ceramic Coating') {
              const duration = details.duration || '2yr'
              const key = `ceramic_coating_${vType}_${duration}`
              price = (cfg[key] ?? cfg.ceramic_coating_base ?? 100.00) * 100
          } else if (serviceName === 'Paint Correction') {
              const key = `paint_correction_${vType}`
              price = (cfg[key] ?? cfg.paint_correction_base ?? 150.00) * 100
          } else if (serviceName === 'Detailing') {
              const type = details.type || 'full'
              const vehicleKey = `detailing_${vType}`
              const baseKey = `detailing_base_${type}`
              price = (cfg[vehicleKey] ?? cfg[baseKey] ?? (type === 'interior' ? 49.99 : type === 'exterior' ? 39.99 : 79.99)) * 100
          } else if (serviceName === 'EV Recharging') {
              price = (cfg.ev_charge_per_kwh ?? 0.35) * 100
          } else if (serviceName === 'Maintenance') {
              price = (cfg.maintenance_base ?? 29.99) * 100
          } else if (serviceName === 'Mechanic Work') {
              price = (cfg.mechanic_work_base ?? 75.00) * 100
          } else if (serviceName === 'Gas Refueling') {
              price = 0
          } else {
              // Fallback to servicePrices from DB if available
              price = servicePrices[serviceName] ?? (serviceName === 'Gas Refueling' || serviceName === 'Refueling' ? 0 : 2000)
          }
          return price
      }

      const getServiceTotal = (serviceName: string, details: any = {}) => {
          const carCount = details.carCount || 1
          if (['Detailing', 'Paint Correction', 'Ceramic Coating'].includes(serviceName)) {
              const cars = details.vehicleTypes || [details.vehicleType || 'Sedan']
              const durations = details.durations || []
              return cars.reduce((acc: number, car: string, idx: number) => {
                  const carDuration = durations[idx] || details.duration || '2yr'
                  return acc + getServicePrice(serviceName, { ...details, vehicleType: car, duration: carDuration })
              }, 0)
          }
          const unitPrice = getServicePrice(serviceName, details)
          if (serviceName === 'EV Recharging') {
              const kwh = details.kwh || 50
              return unitPrice * kwh * carCount
          }
          return unitPrice * carCount
      }

      // 3. Main Calculation Logic
      let subtotal = 0
      const servicesToProcess = bookingData.selectedServices?.length > 0 
          ? bookingData.selectedServices 
          : (bookingData.serviceType ? [bookingData.serviceType] : [])

      // Surge logic is deactivated (always 1.0)
      const surge = getSurgeMultiplier(bookingData.dateTime, cfg)

      servicesToProcess.forEach((serviceName: string) => {
          const details = bookingData.details?.[serviceName] || {}
          const serviceCost = getServiceTotal(serviceName, details)
          const multiplier = 1.0 // Force No Surge
          const surgedCost = Math.round(serviceCost * multiplier)
          subtotal += surgedCost
      })

      // Fuel Cost logic (Never Surged)
      if (servicesToProcess.includes('Gas Refueling')) {
          const refuelDetails = bookingData.details?.['Gas Refueling']
          if (refuelDetails?.gallons) {
              const fuelTypes = refuelDetails.fuelTypes || []
              const gallonsArray = Array.isArray(refuelDetails.gallons) ? refuelDetails.gallons : [refuelDetails.gallons]
              const markup = 1 + (Number(cfg.fuel_markup_percent) ?? 25) / 100

              if (fuelTypes.length > 0) {
                  const avgFuelPrice = fuelTypes.reduce((sum: number, type: string) => sum + (gasPrices[type] || 0), 0) / fuelTypes.length
                  const totalFuelCost = Math.round(gallonsArray.reduce((acc: number, g: number) => acc + (avgFuelPrice * markup * g), 0))
                  subtotal += totalFuelCost
              }
          }
      }

      // Add-ons (Snacks) logic (Never Surged)
      if (bookingData.details?.addOns) {
          const addOnPrices: Record<string, number> = {
              sun: 597, tos: 891, sma: 546, fri: 596, var: 2997,
              chz: 597, gfc: 507, dot: 972, waf: 296, fam: 866,
              aho: 581, rol: 371, rice: 417, pud: 600, mot: 1256,
              fru: 783, res: 375, awrb: 1293, pep: 900, preb: 900,
              c4e: 408, cel: 342, mon: 402, aln: 2997, red: 1617,
              gat: 1617, koo: 300, pop: 224, boo: 6365
          }
          Object.entries(bookingData.details.addOns).forEach(([key, qty]: [string, any]) => {
              const price = addOnPrices[key] || 0
              if (price > 0) {
                  subtotal += price * Number(qty)
              }
          })
      }

      // Promo Logic
      let discount = 0
      const promoCode = passedPromo || bookingData.promoCode
      if (promoCode) {
          const validCode = cfg.promo_new_user_code || 'NEWCAR15'
          if (promoCode.toUpperCase() === String(validCode).toUpperCase()) {
              const percent = Number(cfg.promo_new_user_percent) ?? 15
              discount = Math.round(subtotal * (percent / 100))
              const capDollar = (Number(cfg.promo_cap_dollar) ?? 50) * 100
              discount = Math.min(discount, capDollar)
          }
      }

      const taxRate = getTaxRate(bookingData.location)
      const taxes = Math.round((subtotal - discount) * taxRate)
      const deliveryFee = (Number(cfg.fuel_delivery_fee) ?? 8.00) * 100
      const serviceFee = Math.round(subtotal * ((Number(cfg.service_fee_percent) ?? 0) / 100))
      
      finalAmount = subtotal - discount + taxes + deliveryFee + serviceFee
      debugData = { subtotal, discount, taxes, deliveryFee, serviceFee, surgeMultiplier: surge }
    } else if (manualAmount) {
      finalAmount = Math.round(manualAmount * 100) 
    }

    if (finalAmount <= 0) {
        throw new Error("Invalid final amount calculated")
    }

    // 4. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    })

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret, 
        amount: finalAmount, 
        currency: 'usd',
        debug: debugData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
