const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API = 'http://localhost:5000/api';

async function login(email, password) {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  return res.data.token;
}

async function register(data) {
  const res = await axios.post(`${API}/auth/register`, data);
  return { token: res.data.token, user: res.data.user };
}

function auth(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function runTests() {
  console.log('\n=============================================');
  console.log('|      ESCROW SYSTEM QA TEST SUITE          |');
  console.log('=============================================\n');

  let bugs = [];
  const reportBug = (msg) => { bugs.push(msg); console.log(`🐞 BUG FOUND: ${msg}`); }
  const pass = (msg) => console.log(`✅ PASS: ${msg}`);
  const fail = (msg) => console.log(`❌ FAIL (Test Exception): ${msg}`);

  try {
    // ----------------------------------------------------
    // SETUP
    // ----------------------------------------------------
    const tstamp = Date.now();
    const emp = await register({ email: `emp_${tstamp}@test.com`, password: 'pass123', fullName: 'Employer Test', phone: `07${tstamp.toString().slice(-8)}`, locationCity: 'Nairobi', role: 'EMPLOYER' });
    const wrk = await register({ email: `wrk_${tstamp}@test.com`, password: 'pass123', fullName: 'Worker Test', phone: `07${(tstamp+1).toString().slice(-8)}`, locationCity: 'Nairobi', role: 'WORKER' });
    const adminToken = await login('admin@kazilink.com', 'admin123');

    // Create job + application
    const jobRes = await axios.post(`${API}/jobs`, {
      title: 'QA Test Job', description: 'This is a valid description.', category: 'Software', workersNeeded: 1, jobDate: '2026-05-15', startTime: '08:00', durationHours: 4, locationAddress: 'Nairobi CBD', payPerWorker: 1000, paymentMethod: 'MPESA', applicationDeadline: '2026-05-10'
    }, auth(emp.token));
    const jobId = jobRes.data.id;

    await prisma.application.create({ data: { jobId, workerId: wrk.user.id, status: 'ACCEPTED', coverMessage: 'Test' } });

    console.log('Setup: Users, Job, and Application created.\n');

    // ----------------------------------------------------
    // STEP 1: CREATE -> PENDING
    // ----------------------------------------------------
    let tx;
    try {
      const res = await axios.post(`${API}/transactions/create`, { jobId, workerId: wrk.user.id, paymentMethod: 'MPESA' }, auth(emp.token));
      tx = res.data;
      if (tx.status === 'PENDING') pass('1. Created transaction -> PENDING');
      else reportBug(`Transaction created with status ${tx.status} instead of PENDING`);
    } catch (e) { fail(e.response?.data?.error || e.message); return; }

    // STATE/ROLE CHECKS (PENDING)
    try { await axios.patch(`${API}/transactions/start/${tx.id}`, {}, auth(wrk.token)); reportBug('Worker can start PENDING transaction'); } 
    catch (e) { if(e.response?.status !== 400) reportBug('Start on PENDING did not return 400'); pass('State Machine Check: Cannot START a PENDING transaction'); }

    // ----------------------------------------------------
    // STEP 2: FUND -> VERIFYING
    // ----------------------------------------------------
    try {
      const FormData = require('form-data');
      const form = new FormData();
      form.append('transactionId', tx.id);
      form.append('paymentProof', Buffer.alloc(100), { filename: 'test.jpg', contentType: 'image/jpeg' });
      
      const res = await axios.post(`${API}/transactions/fund`, form, { headers: { ...form.getHeaders(), Authorization: `Bearer ${emp.token}` } });
      if (res.data.status === 'VERIFYING') pass('2. Employer funded -> VERIFYING');
      else reportBug(`Funded transaction is ${res.data.status} instead of VERIFYING`);
    } catch (e) { fail('Fund failed: ' + (e.response?.data?.error || e.message)); }

    // ROLE CHECKS (VERIFYING)
    try { await axios.patch(`${API}/transactions/verify/${tx.id}`, {}, auth(wrk.token)); reportBug('Worker can verify transaction'); } 
    catch (e) { if(e.response?.status !== 403) reportBug('Worker verify did not return 403'); pass('Role Check: Worker cannot VERIFY'); }
    
    try { await axios.patch(`${API}/transactions/verify/${tx.id}`, {}, auth(emp.token)); reportBug('Employer can verify transaction'); } 
    catch (e) { if(e.response?.status !== 403) reportBug('Employer verify did not return 403'); pass('Role Check: Employer cannot VERIFY'); }

    // ----------------------------------------------------
    // STEP 3: VERIFY -> FUNDED
    // ----------------------------------------------------
    try {
      const res = await axios.patch(`${API}/transactions/verify/${tx.id}`, {}, auth(adminToken));
      if (res.data.status === 'FUNDED') pass('3. Admin verified -> FUNDED');
      else reportBug(`Verified transaction is ${res.data.status} instead of FUNDED`);
    } catch (e) { fail('Verify failed: ' + (e.response?.data?.error || e.message)); }

    // ROLE CHECKS (FUNDED)
    try { await axios.patch(`${API}/transactions/start/${tx.id}`, {}, auth(emp.token)); reportBug('Employer can start transaction'); } 
    catch (e) { if(e.response?.status !== 403) reportBug('Employer start did not return 403'); pass('Role Check: Employer cannot START'); }

    // ----------------------------------------------------
    // STEP 4: START -> IN_PROGRESS
    // ----------------------------------------------------
    try {
      const res = await axios.patch(`${API}/transactions/start/${tx.id}`, {}, auth(wrk.token));
      if (res.data.status === 'IN_PROGRESS') pass('4. Worker started -> IN_PROGRESS');
      else reportBug(`Started transaction is ${res.data.status} instead of IN_PROGRESS`);
    } catch (e) { fail('Start failed: ' + (e.response?.data?.error || e.message)); }

    // STATE CHECKS (IN_PROGRESS)
    try { await axios.patch(`${API}/transactions/cancel/${tx.id}`, {}, auth(emp.token)); reportBug('Employer can cancel an IN_PROGRESS transaction'); } 
    catch (e) { if(e.response?.status !== 400) reportBug('Cancel on IN_PROGRESS did not return 400'); pass('State Machine Check: Cannot CANCEL once IN_PROGRESS'); }

    // ----------------------------------------------------
    // STEP 5: COMPLETE -> COMPLETED
    // ----------------------------------------------------
    try {
      const res = await axios.patch(`${API}/transactions/complete/${tx.id}`, {}, auth(wrk.token));
      if (res.data.status === 'COMPLETED') pass('5. Worker completed -> COMPLETED');
      else reportBug(`Completed transaction is ${res.data.status} instead of COMPLETED`);
    } catch (e) { fail('Complete failed: ' + (e.response?.data?.error || e.message)); }

    // ROLE CHECKS (COMPLETED)
    try { await axios.post(`${API}/transactions/release/${tx.id}`, {}, auth(wrk.token)); reportBug('Worker can release funds'); } 
    catch (e) { if(e.response?.status !== 403) reportBug('Worker release did not return 403'); pass('Role Check: Worker cannot RELEASE'); }

    // ----------------------------------------------------
    // STEP 6: RELEASE -> RELEASED
    // ----------------------------------------------------
    try {
      const res = await axios.post(`${API}/transactions/release/${tx.id}`, {}, auth(emp.token));
      if (res.status === 200) pass('6. Employer released -> RELEASED');
      else reportBug(`Release returned status ${res.status}`);
    } catch (e) { fail('Release failed: ' + (e.response?.data?.error || e.message)); }

    // DOUBLE RELEASE CHECK
    try { await axios.post(`${API}/transactions/release/${tx.id}`, {}, auth(emp.token)); reportBug('System allowed a double release'); } 
    catch (e) { if(e.response?.status !== 400) reportBug('Double release did not return 400'); pass('Double Release Check: Blocked second release attempt'); }

    // ----------------------------------------------------
    // STEP 7: DATA CONSISTENCY CHECK
    // ----------------------------------------------------
    try {
      const finalTx = await prisma.transaction.findUnique({ where: { id: tx.id } });
      const workerProfile = await prisma.workerProfile.findUnique({ where: { userId: wrk.user.id } });
      const job = await prisma.job.findUnique({ where: { id: jobId } });

      let consistent = true;
      if (finalTx.status !== 'RELEASED') { reportBug(`Final TX status is ${finalTx.status}, expected RELEASED`); consistent = false; }
      if (job.status !== 'COMPLETED') { reportBug(`Job status is ${job.status}, expected COMPLETED`); consistent = false; }
      if (workerProfile.totalEarned !== 900) { reportBug(`Worker earned ${workerProfile.totalEarned}, expected 900 (1000 - 10%)`); consistent = false; }
      if (workerProfile.totalJobsCompleted !== 1) { reportBug(`Worker total jobs ${workerProfile.totalJobsCompleted}, expected 1`); consistent = false; }

      if (consistent) pass('7. Data Consistency Check: All status fields and worker stats updated atomically');
    } catch (e) { fail('Data check failed: ' + e.message); }

    console.log('\n=============================================');
    if (bugs.length === 0) {
      console.log('✅ ALL TESTS PASSED. ZERO BUGS FOUND.');
    } else {
      console.log(`❌ ${bugs.length} BUGS FOUND:`);
      bugs.forEach((b, i) => console.log(`   ${i+1}. ${b}`));
    }
    console.log('=============================================\n');

  } catch (err) {
    console.error('Test Suite Failed Exceptionally:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
