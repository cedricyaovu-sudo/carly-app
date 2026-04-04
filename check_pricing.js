import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ugqjyfgcosjajazsdydw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncWp5Zmdjb3NqYWphenNkeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTE5NzIsImV4cCI6MjA3ODUyNzk3Mn0.img68c2i5ucWG_94sspK35qldpsC148ODIeVwL8X8ac';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPricing() {
    const { data, error } = await supabase
        .from('pricing_config')
        .select('*');
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log('Pricing Config Rows:', data.length);
    const simplified = data.map(r => `${r.id}: ${r.value}`);
    console.log(simplified.join('\n'));
}

checkPricing();
