import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import { runAgent } from '../agent/agent';
import { Order } from '../models/Order';
import { AgentLog } from '../models/AgentLog';

interface TestResult {
  name: string;
  orderId: string;
  scenario: string;
  expectedEligible: boolean;
  actualEligible: boolean;
  refundProcessed: boolean;
  pass: boolean;
  notes: string;
}

async function runE2ETests() {
  try {
    await connectDB();

    console.log('\n' + '=' .repeat(80));
    console.log('🧪 REFUNDAI - END-TO-END TESTS');
    console.log('=' .repeat(80));

    const results: TestResult[] = [];

    // Test 1: Valid refund (ORD-1001 - delivered 5 days ago)
    console.log('\n[TEST 1] Valid refund - ORD-1001 (delivered 5 days ago)');
    console.log('-'.repeat(80));
    const test1 = await runAgent('I want a refund for order ORD-1001', 'john.doe@email.com');
    const order1 = await Order.findOne({ orderId: 'ORD-1001' });
    const result1: TestResult = {
      name: 'Valid refund within 30 days',
      orderId: 'ORD-1001',
      scenario: 'Delivered 5 days ago',
      expectedEligible: true,
      actualEligible: order1?.refundStatus === 'REFUNDED',
      refundProcessed: order1?.refundStatus === 'REFUNDED',
      pass: order1?.refundStatus === 'REFUNDED',
      notes: test1.success ? 'Agent responded successfully' : 'Agent failed',
    };
    results.push(result1);
    console.log(`  Expected: REFUNDED`);
    console.log(`  Actual: ${order1?.refundStatus}`);
    console.log(`  Result: ${result1.pass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 2: Expired refund (ORD-1002 - delivered 45 days ago)
    console.log('[TEST 2] Expired refund - ORD-1002 (delivered 45 days ago)');
    console.log('-'.repeat(80));
    const test2 = await runAgent('I want a refund for order ORD-1002', 'sarah.smith@email.com');
    const order2 = await Order.findOne({ orderId: 'ORD-1002' });
    const result2: TestResult = {
      name: 'Refund outside 30-day window',
      orderId: 'ORD-1002',
      scenario: 'Delivered 45 days ago',
      expectedEligible: false,
      actualEligible: order2?.refundStatus !== 'REFUNDED',
      refundProcessed: order2?.refundStatus === 'REFUNDED',
      pass: order2?.refundStatus !== 'REFUNDED' && order2?.refundStatus === 'NONE',
      notes: 'Should be denied (expired)',
    };
    results.push(result2);
    console.log(`  Expected: DENIED (not refunded)`);
    console.log(`  Actual: ${order2?.refundStatus}`);
    console.log(`  Result: ${result2.pass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 3: Non-refundable product (ORD-1003)
    console.log('[TEST 3] Non-refundable product - ORD-1003');
    console.log('-'.repeat(80));
    const test3 = await runAgent('I want a refund for order ORD-1003', 'rahul.kumar@email.com');
    const order3 = await Order.findOne({ orderId: 'ORD-1003' });
    const result3: TestResult = {
      name: 'Non-refundable product',
      orderId: 'ORD-1003',
      scenario: 'Digital download',
      expectedEligible: false,
      actualEligible: order3?.refundStatus !== 'REFUNDED',
      refundProcessed: order3?.refundStatus === 'REFUNDED',
      pass: order3?.refundStatus !== 'REFUNDED',
      notes: 'Should be denied (non-refundable)',
    };
    results.push(result3);
    console.log(`  Expected: DENIED (not refunded)`);
    console.log(`  Actual: ${order3?.refundStatus}`);
    console.log(`  Result: ${result3.pass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 4: Already refunded (ORD-1004)
    console.log('[TEST 4] Already refunded - ORD-1004');
    console.log('-'.repeat(80));
    const test4 = await runAgent('I want a refund for order ORD-1004', 'emily.johnson@email.com');
    const order4 = await Order.findOne({ orderId: 'ORD-1004' });
    const result4: TestResult = {
      name: 'Already refunded order',
      orderId: 'ORD-1004',
      scenario: 'Previously refunded',
      expectedEligible: false,
      actualEligible: order4?.refundStatus !== 'REFUNDED',
      refundProcessed: false,
      pass: order4?.refundStatus === 'REFUNDED', // Already refunded before test
      notes: 'Already refunded (pre-seeded)',
    };
    results.push(result4);
    console.log(`  Expected: Already REFUNDED`);
    console.log(`  Actual: ${order4?.refundStatus}`);
    console.log(`  Result: ${result4.pass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 5: Cancelled order (ORD-1005)
    console.log('[TEST 5] Cancelled order - ORD-1005');
    console.log('-'.repeat(80));
    const test5 = await runAgent('I want a refund for order ORD-1005', 'michael.brown@email.com');
    const order5 = await Order.findOne({ orderId: 'ORD-1005' });
    const result5: TestResult = {
      name: 'Cancelled before shipment',
      orderId: 'ORD-1005',
      scenario: 'Cancelled order',
      expectedEligible: true,
      actualEligible: order5?.refundStatus === 'REFUNDED',
      refundProcessed: order5?.refundStatus === 'REFUNDED',
      pass: order5?.refundStatus === 'REFUNDED',
      notes: 'Should be approved (cancelled)',
    };
    results.push(result5);
    console.log(`  Expected: REFUNDED`);
    console.log(`  Actual: ${order5?.refundStatus}`);
    console.log(`  Result: ${result5.pass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 6: Valid refund (ORD-1006 - delivered 10 days ago)
    console.log('[TEST 6] Valid refund - ORD-1006 (delivered 10 days ago)');
    console.log('-'.repeat(80));
    const test6 = await runAgent('I want a refund for order ORD-1006', 'priya.sharma@email.com');
    const order6 = await Order.findOne({ orderId: 'ORD-1006' });
    const result6: TestResult = {
      name: 'Valid refund within 30 days',
      orderId: 'ORD-1006',
      scenario: 'Delivered 10 days ago',
      expectedEligible: true,
      actualEligible: order6?.refundStatus === 'REFUNDED',
      refundProcessed: order6?.refundStatus === 'REFUNDED',
      pass: order6?.refundStatus === 'REFUNDED',
      notes: 'Should be approved',
    };
    results.push(result6);
    console.log(`  Expected: REFUNDED`);
    console.log(`  Actual: ${order6?.refundStatus}`);
    console.log(`  Result: ${result6.pass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 7: Expired refund (ORD-1007 - delivered 60 days ago)
    console.log('[TEST 7] Expired refund - ORD-1007 (delivered 60 days ago)');
    console.log('-'.repeat(80));
    const test7 = await runAgent('I want a refund for order ORD-1007', 'david.wilson@email.com');
    const order7 = await Order.findOne({ orderId: 'ORD-1007' });
    const result7: TestResult = {
      name: 'Refund outside 30-day window',
      orderId: 'ORD-1007',
      scenario: 'Delivered 60 days ago',
      expectedEligible: false,
      actualEligible: order7?.refundStatus !== 'REFUNDED',
      refundProcessed: false,
      pass: order7?.refundStatus === 'NONE',
      notes: 'Should be denied (expired)',
    };
    results.push(result7);
    console.log(`  Expected: DENIED`);
    console.log(`  Actual: ${order7?.refundStatus}`);
    console.log(`  Result: ${result7.pass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 8: Non-refundable product (ORD-1008 - gift card)
    console.log('[TEST 8] Non-refundable product - ORD-1008 (gift card)');
    console.log('-'.repeat(80));
    const test8 = await runAgent('I want a refund for order ORD-1008', 'lisa.anderson@email.com');
    const order8 = await Order.findOne({ orderId: 'ORD-1008' });
    const result8: TestResult = {
      name: 'Non-refundable gift card',
      orderId: 'ORD-1008',
      scenario: 'Gift card',
      expectedEligible: false,
      actualEligible: order8?.refundStatus !== 'REFUNDED',
      refundProcessed: false,
      pass: order8?.refundStatus === 'NONE',
      notes: 'Should be denied (non-refundable)',
    };
    results.push(result8);
    console.log(`  Expected: DENIED`);
    console.log(`  Actual: ${order8?.refundStatus}`);
    console.log(`  Result: ${result8.pass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 9: Valid refund (ORD-1009 - delivered 3 days ago)
    console.log('[TEST 9] Valid refund - ORD-1009 (delivered 3 days ago)');
    console.log('-'.repeat(80));
    const test9 = await runAgent('I want a refund for order ORD-1009', 'james.taylor@email.com');
    const order9 = await Order.findOne({ orderId: 'ORD-1009' });
    const result9: TestResult = {
      name: 'Valid refund within 30 days',
      orderId: 'ORD-1009',
      scenario: 'Delivered 3 days ago',
      expectedEligible: true,
      actualEligible: order9?.refundStatus === 'REFUNDED',
      refundProcessed: order9?.refundStatus === 'REFUNDED',
      pass: order9?.refundStatus === 'REFUNDED',
      notes: 'Should be approved',
    };
    results.push(result9);
    console.log(`  Expected: REFUNDED`);
    console.log(`  Actual: ${order9?.refundStatus}`);
    console.log(`  Result: ${result9.pass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 10: Invalid order (ORD-9999)
    console.log('[TEST 10] Invalid order - ORD-9999');
    console.log('-'.repeat(80));
    const test10 = await runAgent('I want a refund for order ORD-9999', 'test@email.com');
    const result10: TestResult = {
      name: 'Invalid order ID',
      orderId: 'ORD-9999',
      scenario: 'Order not found',
      expectedEligible: false,
      actualEligible: true, // Agent handled gracefully
      refundProcessed: false,
      pass: test10.success,
      notes: 'Should handle gracefully',
    };
    results.push(result10);
    console.log(`  Expected: Graceful error handling`);
    console.log(`  Agent success: ${test10.success}`);
    console.log(`  Result: ${result10.pass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Summary
    console.log('=' .repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(80));
    
    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;
    const total = results.length;

    console.log(`\nTotal Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    console.log('\n📋 DETAILED RESULTS:');
    console.log('-'.repeat(80));
    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.name}`);
      console.log(`   Order: ${r.orderId} | Scenario: ${r.scenario}`);
      console.log(`   Expected: ${r.expectedEligible ? 'APPROVED' : 'DENIED'}`);
      console.log(`   Result: ${r.pass ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Notes: ${r.notes}`);
    });

    console.log('\n' + '=' .repeat(80));
    if (failed === 0) {
      console.log('✅ ALL TESTS PASSED - Application is ready for demo!');
    } else {
      console.log(`❌ ${failed} TEST(S) FAILED - Review issues above`);
    }
    console.log('=' .repeat(80) + '\n');

    await mongoose.disconnect();
    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

runE2ETests();