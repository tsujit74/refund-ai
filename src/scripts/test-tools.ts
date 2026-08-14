import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import { generateSessionId } from '../lib/utils';
import { getCustomerProfile } from '../tools/getCustomerProfile';
import { getOrderDetails } from '../tools/getOrderDetails';
import { getRefundPolicy } from '../tools/getRefundPolicy';
import { validateRefundEligibility } from '../tools/validateRefundEligibility';
import { processRefund } from '../tools/processRefund';

async function testTools() {
  try {
    await connectDB();
    const sessionId = generateSessionId();

    console.log('\n🧪 AGENT TOOLS TESTS');
    console.log('=' .repeat(70));
    console.log(`Session ID: ${sessionId}\n`);

    // Test 1: getCustomerProfile
    console.log('[TEST 1] getCustomerProfile');
    const customerResult = await getCustomerProfile({ email: 'john.doe@email.com' }, sessionId);
    console.log(`  Success: ${customerResult.success}`);
    if (customerResult.success) {
      console.log(`  Customer: ${customerResult.customer?.name} (${customerResult.customer?.email})`);
    } else {
      console.log(`  Error: ${customerResult.error}`);
    }
    console.log(`  Result: ${customerResult.success ? 'PASS ' : 'FAIL ❌'}\n`);

    // Test 2: getOrderDetails
    console.log('[TEST 2] getOrderDetails');
    const orderResult = await getOrderDetails({ orderId: 'ORD-1001' }, sessionId);
    console.log(`  Success: ${orderResult.success}`);
    if (orderResult.success) {
      console.log(`  Order: ${orderResult.order?.orderId} - ${orderResult.order?.productName}`);
      console.log(`  Amount: $${orderResult.order?.amount}`);
      console.log(`  Status: ${orderResult.order?.status}`);
    } else {
      console.log(`  Error: ${orderResult.error}`);
    }
    console.log(`  Result: ${orderResult.success ? 'PASS ' : 'FAIL ❌'}\n`);

    // Test 3: getRefundPolicy
    console.log('[TEST 3] getRefundPolicy');
    const policyResult = await getRefundPolicy({}, sessionId);
    console.log(`  Success: ${policyResult.success}`);
    console.log(`  Policy length: ${policyResult.policy?.length} characters`);
    console.log(`  Result: ${policyResult.success ? 'PASS ' : 'FAIL ❌'}\n`);

    // Test 4: validateRefundEligibility (valid order)
    console.log('[TEST 4] validateRefundEligibility - ORD-1001 (valid)');
    const validResult = await validateRefundEligibility({ orderId: 'ORD-1001' }, sessionId);
    console.log(`  Eligible: ${validResult.eligible ? 'YES ' : 'NO ❌'}`);
    console.log(`  Reason: ${validResult.reason}`);
    console.log(`  Expected: YES`);
    console.log(`  Result: ${validResult.eligible ? 'PASS ' : 'FAIL ❌'}\n`);

    // Test 5: validateRefundEligibility (expired order)
    console.log('[TEST 5] validateRefundEligibility - ORD-1002 (expired)');
    const expiredResult = await validateRefundEligibility({ orderId: 'ORD-1002' }, sessionId);
    console.log(`  Eligible: ${expiredResult.eligible ? 'YES ' : 'NO ❌'}`);
    console.log(`  Reason: ${expiredResult.reason}`);
    console.log(`  Expected: NO`);
    console.log(`  Result: ${!expiredResult.eligible ? 'PASS ' : 'FAIL ❌'}\n`);

    // Test 6: processRefund (should fail for expired order)
    console.log('[TEST 6] processRefund - ORD-1002 (should be blocked)');
    const processResult = await processRefund({ orderId: 'ORD-1002' }, sessionId);
    console.log(`  Success: ${processResult.success}`);
    console.log(`  Message: ${processResult.message}`);
    console.log(`  Expected: FAIL (not eligible)`);
    console.log(`  Result: ${!processResult.success ? 'PASS ' : 'FAIL ❌'}\n`);

    // Summary
    const allPassed = 
      customerResult.success &&
      orderResult.success &&
      policyResult.success &&
      validResult.eligible &&
      !expiredResult.eligible &&
      !processResult.success;

    console.log('=' .repeat(70));
    if (allPassed) {
      console.log(' ALL TOOL TESTS PASSED\n');
    } else {
      console.log('SOME TOOL TESTS FAILED\n');
    }

    await mongoose.disconnect();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testTools();