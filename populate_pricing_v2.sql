-- Enable RLS and public read access for configuration tables
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.pricing_config FOR SELECT USING (true);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.services FOR SELECT USING (true);

-- Clear existing data
DELETE FROM pricing_config;

-- Insert pricing configurations with units
INSERT INTO pricing_config (id, category, value, unit) VALUES
-- Base Prices
('detailing_base_full', 'base_prices', 79.99, 'USD'),
('detailing_base_interior', 'base_prices', 49.99, 'USD'),
('detailing_base_exterior', 'base_prices', 39.99, 'USD'),
('paint_correction_base', 'base_prices', 150.00, 'USD'),
('ceramic_coating_base', 'base_prices', 100.00, 'USD'),
('maintenance_base', 'base_prices', 29.99, 'USD'),
('mechanic_work_base', 'base_prices', 75.00, 'USD'),
('ev_charge_per_kwh', 'base_prices', 0.35, 'USD/kWh'),

-- Detailing Vehicle Pricing
('detailing_sedan', 'vehicle_pricing', 125.00, 'USD'),
('detailing_suv', 'vehicle_pricing', 175.00, 'USD'),
('detailing_small_truck', 'vehicle_pricing', 225.00, 'USD'),
('detailing_large_truck', 'vehicle_pricing', 250.00, 'USD'),
('detailing_semi_truck', 'vehicle_pricing', 925.00, 'USD'),

-- Paint Correction Vehicle Pricing
('paint_correction_sedan', 'vehicle_pricing', 325.00, 'USD'),
('paint_correction_suv', 'vehicle_pricing', 405.00, 'USD'),
('paint_correction_small_truck', 'vehicle_pricing', 475.00, 'USD'),
('paint_correction_large_truck', 'vehicle_pricing', 525.00, 'USD'),
('paint_correction_semi_truck', 'vehicle_pricing', 1500.00, 'USD'),

-- Ceramic Coating Vehicle Pricing (2yr / 5yr)
('ceramic_coating_sedan_2yr', 'vehicle_pricing', 500.00, 'USD'),
('ceramic_coating_sedan_5yr', 'vehicle_pricing', 825.00, 'USD'),
('ceramic_coating_suv_truck_2yr', 'vehicle_pricing', 625.00, 'USD'),
('ceramic_coating_suv_truck_5yr', 'vehicle_pricing', 985.00, 'USD'),
('ceramic_coating_exotic_2yr', 'vehicle_pricing', 725.00, 'USD'),
('ceramic_coating_exotic_5yr', 'vehicle_pricing', 1190.00, 'USD'),
('ceramic_coating_semi_truck_2yr', 'vehicle_pricing', 2250.00, 'USD'),
('ceramic_coating_semi_truck_5yr', 'vehicle_pricing', 3250.00, 'USD'),

-- Surge
('surge_multiplier_peak', 'surge', 1.0, 'multiplier'),
('surge_multiplier_weekend', 'surge', 1.0, 'multiplier'),
('surge_multiplier_holiday', 'surge', 1.0, 'multiplier'),

-- Fuel
('fuel_markup_percent', 'fuel', 25.0, 'percent'),
('fuel_delivery_fee', 'fuel', 8.00, 'USD'),

-- Taxes and Fees
('service_fee_percent', 'taxes', 0.0, 'percent'),
('tax_rate_ga', 'taxes', 6.53, 'percent'),
('tax_rate_tx', 'taxes', 6.53, 'percent'),

-- Promos
('promo_cap_percent', 'promos', 25.0, 'percent'),
('promo_cap_dollar', 'promos', 50.0, 'USD'),
('promo_new_user_percent', 'promos', 15.0, 'percent');
