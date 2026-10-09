import { supabase } from './lib/supabaseClient';

// Test connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('categories').select('count');
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('Connection successful!');
    console.log('Categories count:', data);
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testConnection();
