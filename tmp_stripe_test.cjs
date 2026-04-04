import fetch from 'node-fetch';
import 'dotenv/config';

async function test() {
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch('https://ugqjyfgcosjajazsdydw.supabase.co/functions/v1/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`
    },
    body: JSON.stringify({ amount: 50 })
  });
  const data = await res.json();
  console.log(data);
}

test();
