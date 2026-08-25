import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.+)/);

if (!urlMatch || !keyMatch) {
  console.error('❌ Could not read Supabase credentials from .env');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseAnonKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runConcurrencyTest() {
  console.log('================================================================');
  console.log('PHASE 7: LIVE CONCURRENCY & OVERSELLING SECURITY VERIFICATION');
  console.log('================================================================\n');

  // Step 1: Fetch live products
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, title, price, category, purchased_qty');

  if (prodErr || !products || products.length === 0) {
    console.error('❌ Failed to fetch products:', prodErr?.message);
    process.exit(1);
  }

  console.log(`Found ${products.length} products in database.`);

  // Find a product for testing
  let targetProduct = products.find(p => p.purchased_qty > 0) || products[0];

  console.log(`\nSelected Target Product for Concurrency Stress Test:`);
  console.log(`  ID: ${targetProduct.id}`);
  console.log(`  Title: "${targetProduct.title}"`);
  console.log(`  Price: ${targetProduct.price} EGP`);
  console.log(`  Purchased Qty: ${targetProduct.purchased_qty}`);

  // Test with 15 concurrent requests to test inventory boundary
  const CONCURRENT_REQUESTS = 15;
  const testBatchId = `CONC_EXHAUST_${Date.now()}`;
  console.log(`\nLaunching ${CONCURRENT_REQUESTS} SIMULTANEOUS checkout requests to test stock boundary (Batch ID: ${testBatchId})...`);

  const startTime = Date.now();

  const promises = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) => {
    const customerName = `${testBatchId}_Customer_${i + 1}`;
    const phone = `010${Math.floor(10000000 + Math.random() * 90000000)}`;

    return supabase.rpc('create_order', {
      p_customer_name: customerName,
      p_phone: phone,
      p_address: `Concurrency Test Street Apt ${i + 1}`,
      p_city: 'Cairo',
      p_payment_method: 'Cash on Delivery',
      p_items: [{ product_id: targetProduct.id, quantity: 1 }],
    }).then(res => ({
      index: i + 1,
      customerName,
      success: !res.error && res.data?.success === true,
      data: res.data,
      error: res.error?.message,
    }));
  });

  const results = await Promise.all(promises);
  const durationMs = Date.now() - startTime;

  console.log(`\nCompleted in ${durationMs}ms.\n`);

  const successfulAttempts = results.filter(r => r.success);
  const rejectedAttempts = results.filter(r => !r.success);

  console.log(`--- RESULTS SUMMARY ---`);
  console.log(`Total Concurrent Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Successful Orders: ${successfulAttempts.length}`);
  console.log(`Rejected Requests: ${rejectedAttempts.length}`);

  console.log(`\nSuccessful Orders Detail:`);
  successfulAttempts.forEach(s => {
    console.log(`  #${s.index}: Order ID ${s.data.order_id} | Total: ${s.data.total_amount} EGP | Status: ${s.data.status}`);
  });

  console.log(`\nSample Rejections (if any):`);
  rejectedAttempts.slice(0, 3).forEach(r => {
    console.log(`  #${r.index}: ${r.error}`);
  });

  // Verify all successful orders have Pending status and correct calculated total
  const expectedSubtotal = parseFloat(targetProduct.price);
  const expectedShipping = expectedSubtotal >= 200.00 ? 0.00 : 15.00;
  const expectedTotal = expectedSubtotal + expectedShipping;

  const validTotals = successfulAttempts.every(s => parseFloat(s.data.total_amount) === expectedTotal);
  const validStatuses = successfulAttempts.every(s => s.data.status === 'Pending');

  console.log(`\nData Integrity Checks on Successful Orders:`);
  console.log(`  Authoritative Totals Verified (${expectedTotal} EGP): ${validTotals ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Status 'Pending' Verified: ${validStatuses ? '✅ PASS' : '❌ FAIL'}`);

  return {
    targetProduct,
    CONCURRENT_REQUESTS,
    successfulAttempts,
    rejectedAttempts,
    durationMs,
    expectedTotal,
    validTotals,
    validStatuses,
  };
}

runConcurrencyTest().catch(console.error);
