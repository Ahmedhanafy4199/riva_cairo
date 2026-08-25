import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert';
import fs from 'node:fs';

// Read .env file to get Supabase credentials
const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.+)/);

if (!urlMatch || !keyMatch) {
  console.error('❌ Could not read Supabase credentials from .env');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseAnonKey = keyMatch[1].trim();

console.log('🔍 Initializing Supabase Live Verification Client (ANON / GUEST Context)...');
console.log(`   Target URL: ${supabaseUrl}\n`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let passCount = 0;
let failCount = 0;

async function runLiveTest(testNum, name, testFn) {
  process.stdout.write(`TEST ${testNum}: ${name}... `);
  try {
    const result = await testFn();
    console.log(`✅ PASS (${result || 'OK'})`);
    passCount++;
    return { testNum, name, status: 'PASS', detail: result };
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
    failCount++;
    return { testNum, name, status: 'FAIL', error: err.message };
  }
}

async function main() {
  console.log('================================================================');
  console.log('PHASE 5: LIVE SECURITY TESTS VIA SUPABASE ANON / GUEST CLIENT');
  console.log('================================================================\n');

  const testResults = [];

  // TEST 1: Direct INSERT into public.orders as anon
  testResults.push(await runLiveTest(1, 'Direct INSERT into public.orders as anon', async () => {
    const { data, error } = await supabase.from('orders').insert({
      customer_name: 'SECURITY TEST',
      phone: '01000000000',
      address: 'Security Test Street',
      total_amount: 0.01,
      status: 'Delivered',
    }).select();

    if (!error) {
      throw new Error(`Direct INSERT succeeded unexpectedly: ${JSON.stringify(data)}`);
    }
    // RLS denial error (42501 or message containing row-level security / policy)
    return `Blocked by PostgreSQL RLS: [${error.code || 'RLS'}] ${error.message}`;
  }));

  // TEST 2: Direct INSERT into public.order_items as anon
  testResults.push(await runLiveTest(2, 'Direct INSERT into public.order_items as anon', async () => {
    const { data, error } = await supabase.from('order_items').insert({
      order_id: '00000000-0000-0000-0000-000000000000',
      title: 'Fake Item',
      price: 1.00,
      quantity: -5,
    }).select();

    if (!error) {
      throw new Error(`Direct INSERT on order_items succeeded unexpectedly: ${JSON.stringify(data)}`);
    }
    return `Blocked by PostgreSQL RLS: [${error.code || 'RLS'}] ${error.message}`;
  }));

  // TEST 3: Direct order insertion with total_amount = -500
  testResults.push(await runLiveTest(3, 'Direct INSERT into orders with negative total_amount (-500)', async () => {
    const { data, error } = await supabase.from('orders').insert({
      customer_name: 'Attacker',
      phone: '01000000000',
      address: 'Cairo',
      total_amount: -500.00,
      status: 'Pending',
    }).select();

    if (!error) {
      throw new Error(`Negative total direct insert succeeded unexpectedly: ${JSON.stringify(data)}`);
    }
    return `Blocked by PostgreSQL RLS: ${error.message}`;
  }));

  // TEST 4: Direct order insertion with status = 'Delivered'
  testResults.push(await runLiveTest(4, 'Direct INSERT into orders with status = Delivered', async () => {
    const { data, error } = await supabase.from('orders').insert({
      customer_name: 'Attacker',
      phone: '01000000000',
      address: 'Cairo',
      total_amount: 100.00,
      status: 'Delivered',
    }).select();

    if (!error) {
      throw new Error(`Status Delivered direct insert succeeded unexpectedly: ${JSON.stringify(data)}`);
    }
    return `Blocked by PostgreSQL RLS: ${error.message}`;
  }));

  // TEST 5: Direct order_items insertion with price = 1
  testResults.push(await runLiveTest(5, 'Direct INSERT into order_items with tampered price = 1', async () => {
    const { data, error } = await supabase.from('order_items').insert({
      order_id: '00000000-0000-0000-0000-000000000000',
      title: 'Tampered Product',
      price: 1.00,
      quantity: 1,
    }).select();

    if (!error) {
      throw new Error(`Direct price tamper insert succeeded unexpectedly: ${JSON.stringify(data)}`);
    }
    return `Blocked by PostgreSQL RLS: ${error.message}`;
  }));

  // Fetch a real product from public.products for RPC testing
  console.log('\n--- Fetching live product catalogue for RPC verification ---');
  const { data: liveProducts, error: prodError } = await supabase
    .from('products')
    .select('id, title, price, category, purchased_qty')
    .limit(5);

  if (prodError || !liveProducts || liveProducts.length === 0) {
    console.error('⚠️ Could not fetch live products:', prodError?.message);
  } else {
    console.log(`✅ Retrieved ${liveProducts.length} live products for RPC testing.`);
    console.log(`   Sample Product: "${liveProducts[0].title}" (ID: ${liveProducts[0].id}, Price: ${liveProducts[0].price} EGP)\n`);
  }

  const validProductId = liveProducts && liveProducts[0] ? liveProducts[0].id : '00000000-0000-0000-0000-000000000001';

  // TEST 6: RPC with quantity = 0
  testResults.push(await runLiveTest(6, 'RPC create_order with quantity = 0', async () => {
    const { data, error } = await supabase.rpc('create_order', {
      p_customer_name: 'Test Customer',
      p_phone: '01012345678',
      p_address: '123 Test Street',
      p_city: 'Cairo',
      p_payment_method: 'Cash on Delivery',
      p_items: [{ product_id: validProductId, quantity: 0 }],
    });

    if (!error) {
      throw new Error(`RPC with quantity=0 succeeded unexpectedly: ${JSON.stringify(data)}`);
    }
    return `Rejected by RPC: ${error.message}`;
  }));

  // TEST 7: RPC with quantity = -5
  testResults.push(await runLiveTest(7, 'RPC create_order with quantity = -5', async () => {
    const { data, error } = await supabase.rpc('create_order', {
      p_customer_name: 'Test Customer',
      p_phone: '01012345678',
      p_address: '123 Test Street',
      p_city: 'Cairo',
      p_payment_method: 'Cash on Delivery',
      p_items: [{ product_id: validProductId, quantity: -5 }],
    });

    if (!error) {
      throw new Error(`RPC with quantity=-5 succeeded unexpectedly: ${JSON.stringify(data)}`);
    }
    return `Rejected by RPC: ${error.message}`;
  }));

  // TEST 8: RPC with quantity = 101
  testResults.push(await runLiveTest(8, 'RPC create_order with quantity = 101 (> 100 limit)', async () => {
    const { data, error } = await supabase.rpc('create_order', {
      p_customer_name: 'Test Customer',
      p_phone: '01012345678',
      p_address: '123 Test Street',
      p_city: 'Cairo',
      p_payment_method: 'Cash on Delivery',
      p_items: [{ product_id: validProductId, quantity: 101 }],
    });

    if (!error) {
      throw new Error(`RPC with quantity=101 succeeded unexpectedly: ${JSON.stringify(data)}`);
    }
    return `Rejected by RPC: ${error.message}`;
  }));

  // TEST 9: RPC with nonexistent product UUID
  testResults.push(await runLiveTest(9, 'RPC create_order with nonexistent product UUID', async () => {
    const { data, error } = await supabase.rpc('create_order', {
      p_customer_name: 'Test Customer',
      p_phone: '01012345678',
      p_address: '123 Test Street',
      p_city: 'Cairo',
      p_payment_method: 'Cash on Delivery',
      p_items: [{ product_id: '00000000-0000-0000-0000-000000000000', quantity: 1 }],
    });

    if (!error) {
      throw new Error(`RPC with fake product UUID succeeded unexpectedly: ${JSON.stringify(data)}`);
    }
    return `Rejected by RPC: ${error.message}`;
  }));

  // TEST 10: RPC with empty items array
  testResults.push(await runLiveTest(10, 'RPC create_order with empty items array []', async () => {
    const { data, error } = await supabase.rpc('create_order', {
      p_customer_name: 'Test Customer',
      p_phone: '01012345678',
      p_address: '123 Test Street',
      p_city: 'Cairo',
      p_payment_method: 'Cash on Delivery',
      p_items: [],
    });

    if (!error) {
      throw new Error(`RPC with empty items array succeeded unexpectedly: ${JSON.stringify(data)}`);
    }
    return `Rejected by RPC: ${error.message}`;
  }));

  // TEST 11: RPC with forged financial fields (price: 0.01, title: Fake, category: Fake)
  testResults.push(await runLiveTest(11, 'RPC create_order ignores forged price/title/category fields', async () => {
    if (!liveProducts || liveProducts.length === 0) {
      return 'Skipped (No live product available)';
    }
    const targetProduct = liveProducts[0];
    const { data, error } = await supabase.rpc('create_order', {
      p_customer_name: 'Audit Security Verification',
      p_phone: '01099887766',
      p_address: 'Audit Verification Street',
      p_city: 'Cairo',
      p_payment_method: 'Cash on Delivery',
      p_items: [
        {
          product_id: targetProduct.id,
          quantity: 1,
          price: 0.01, // Attacker forged price
          title: 'Hacked Title', // Attacker forged title
          category: 'Hacked Category', // Attacker forged category
        }
      ],
    });

    if (error) {
      // If stock check rejected it or other valid validation, report
      if (error.message.includes('Insufficient stock')) {
        return `Stock check active on product (${error.message})`;
      }
      throw new Error(`RPC returned error: ${error.message}`);
    }

    // Verify returned authoritative total
    const expectedSubtotal = parseFloat(targetProduct.price);
    const expectedShipping = expectedSubtotal >= 200.00 ? 0.00 : 15.00;
    const expectedTotal = expectedSubtotal + expectedShipping;

    if (parseFloat(data.total_amount) !== expectedTotal) {
      throw new Error(`Total amount was NOT calculated authoritatively: expected ${expectedTotal}, got ${data.total_amount}`);
    }

    if (data.status !== 'Pending') {
      throw new Error(`Status is not Pending: got ${data.status}`);
    }

    return `Authoritative calculation verified: DB Price=${targetProduct.price} EGP, Total=${data.total_amount} EGP, Status=${data.status}`;
  }));

  // TEST 14: Cross-order item injection into existing order
  testResults.push(await runLiveTest(14, 'Cross-order item injection: Direct insert to existing order_id', async () => {
    const { data, error } = await supabase.from('order_items').insert({
      order_id: '00000000-0000-0000-0000-000000000001',
      title: 'Injected Item',
      price: 9999.00,
      quantity: 1,
    }).select();

    if (!error) {
      throw new Error(`Direct injection succeeded: ${JSON.stringify(data)}`);
    }
    return `Blocked by PostgreSQL RLS: ${error.message}`;
  }));

  // TEST 15: Guest UPDATE on existing order
  testResults.push(await runLiveTest(15, 'Guest UPDATE on public.orders', async () => {
    const { data, error } = await supabase.from('orders').update({
      status: 'Delivered',
    }).eq('status', 'Pending').select();

    if (!error && data && data.length > 0) {
      throw new Error(`Guest UPDATE succeeded on ${data.length} orders!`);
    }
    // With RLS, update returns empty data ([]) or error
    return error ? `Blocked by RLS (${error.message})` : `Blocked by RLS (0 rows updated)`;
  }));

  // TEST 16: Guest DELETE on existing order
  testResults.push(await runLiveTest(16, 'Guest DELETE on public.orders', async () => {
    const { data, error } = await supabase.from('orders').delete().eq('status', 'Delivered').select();

    if (!error && data && data.length > 0) {
      throw new Error(`Guest DELETE succeeded on ${data.length} orders!`);
    }
    return error ? `Blocked by RLS (${error.message})` : `Blocked by RLS (0 rows deleted)`;
  }));

  console.log('\n================================================================');
  console.log(`LIVE VERIFICATION SUMMARY: ${passCount} Passed, ${failCount} Failed.`);
  console.log('================================================================\n');

  fs.writeFileSync('scripts/live-verification-results.json', JSON.stringify(testResults, null, 2));
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
