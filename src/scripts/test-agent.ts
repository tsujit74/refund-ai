import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import { runAgent } from '../agent/agent';
import { AgentLog } from '../models/AgentLog';

async function testAgent() {
  try {
    await connectDB();

    console.log('\n🤖 AGENT TESTS');
    console.log('='.repeat(70));

    // Test 1: Valid refund request
    console.log('\n[TEST 1] Valid refund - ORD-1001');

    const test1 = await runAgent(
      'I want a refund for order ORD-1001',
      'john.doe@email.com'
    );

    console.log(`Success: ${test1.success ? '✅' : '❌'}`);

    const lastMessage1 = test1.messages[test1.messages.length - 1];

    console.log('Response:');
    console.log(`  🤖 ${lastMessage1?.content || 'No response'}`);

    const logs1 = await AgentLog.find({
      sessionId: test1.sessionId,
    });

    console.log(`Logs: ${logs1.length}`);

    console.log(`Result: ${test1.success ? 'PASS ✅' : 'FAIL ❌'}`);

    // Test 2: Denied refund request
    console.log('\n[TEST 2] Denied refund - ORD-1002 (expired)');

    const test2 = await runAgent(
      'I want a refund for order ORD-1002',
      'sarah.smith@email.com'
    );

    console.log(`Success: ${test2.success ? '✅' : '❌'}`);

    const lastMessage2 = test2.messages[test2.messages.length - 1];

    console.log('Response:');
    console.log(`  🤖 ${lastMessage2?.content || 'No response'}`);

    const deniedLogs = await AgentLog.find({
      sessionId: test2.sessionId,
      type: 'REFUND_DENIED',
    });

    console.log(
      `Refund denied logged: ${deniedLogs.length > 0 ? '✅' : '❌'}`
    );

    console.log(`Result: ${test2.success ? 'PASS ✅' : 'FAIL ❌'}`);

    // Test 3: Invalid order
    console.log('\n[TEST 3] Invalid order - ORD-9999');

    const test3 = await runAgent(
      'I want a refund for order ORD-9999',
      'test@email.com'
    );

    console.log(`Success: ${test3.success ? '✅' : '❌'}`);

    const lastMessage3 = test3.messages[test3.messages.length - 1];

    console.log('Response:');
    console.log(`  🤖 ${lastMessage3?.content || 'No response'}`);

    console.log(`Result: ${test3.success ? 'PASS ✅' : 'FAIL ❌'}`);

    // Summary
    const allPassed = test1.success && test2.success && test3.success;

    console.log('\n' + '='.repeat(70));

    if (allPassed) {
      console.log('✅ ALL AGENT TESTS PASSED');
    } else {
      console.log('❌ SOME AGENT TESTS FAILED');
    }

    await mongoose.disconnect();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testAgent();