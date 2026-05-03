const axios = require('axios');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');

const API = 'http://localhost:5000/api';
const token = jwt.sign(
  { id: 'fake-employer-id', email: 'fake@test.com', role: 'EMPLOYER' },
  'change_me_to_a_strong_random_secret',
  { expiresIn: '1d' }
);

function auth() {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function test() {
  console.log('=== CLOUDINARY UPLOAD VALIDATION TESTS ===\n');

  // TEST 1: No file attached → should reject
  try {
    const form = new FormData();
    form.append('transactionId', 'fake-tx-id');
    const res = await axios.post(`${API}/transactions/fund`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    });
    console.log('❌ TEST 1 FAILED: Accepted request without file');
  } catch (e) {
    if (e.response?.status === 400) {
      console.log(`✅ TEST 1 PASSED: No file → "${e.response.data.error}"`);
    } else {
      console.log('❌ TEST 1 FAILED:', e.response?.status, e.response?.data || e.message);
    }
  }

  // TEST 2: Wrong file type (text file) → should reject
  try {
    const form = new FormData();
    form.append('transactionId', 'fake-tx-id');
    form.append('paymentProof', Buffer.from('this is not an image'), {
      filename: 'malicious.txt',
      contentType: 'text/plain'
    });
    const res = await axios.post(`${API}/transactions/fund`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    });
    console.log('❌ TEST 2 FAILED: Accepted text file');
  } catch (e) {
    if (e.response?.status === 400) {
      console.log(`✅ TEST 2 PASSED: Text file rejected → "${e.response.data.error}"`);
    } else {
      console.log('❌ TEST 2 FAILED:', e.response?.status, e.response?.data || e.message);
    }
  }

  // TEST 3: Wrong MIME type disguised as image → should reject
  try {
    const form = new FormData();
    form.append('transactionId', 'fake-tx-id');
    form.append('paymentProof', Buffer.from('fake pdf content'), {
      filename: 'receipt.pdf',
      contentType: 'application/pdf'
    });
    const res = await axios.post(`${API}/transactions/fund`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    });
    console.log('❌ TEST 3 FAILED: Accepted PDF file');
  } catch (e) {
    if (e.response?.status === 400) {
      console.log(`✅ TEST 3 PASSED: PDF rejected → "${e.response.data.error}"`);
    } else {
      console.log('❌ TEST 3 FAILED:', e.response?.status, e.response?.data || e.message);
    }
  }

  // TEST 4: Oversized file (3MB) → should reject
  try {
    const form = new FormData();
    form.append('transactionId', 'fake-tx-id');
    const bigBuffer = Buffer.alloc(3 * 1024 * 1024, 0xFF); // 3MB
    form.append('paymentProof', bigBuffer, {
      filename: 'huge.jpg',
      contentType: 'image/jpeg'
    });
    const res = await axios.post(`${API}/transactions/fund`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    console.log('❌ TEST 4 FAILED: Accepted oversized file');
  } catch (e) {
    if (e.response?.status === 400) {
      console.log(`✅ TEST 4 PASSED: 3MB file rejected → "${e.response.data.error}"`);
    } else {
      console.log('❌ TEST 4 FAILED:', e.response?.status, e.response?.data || e.message);
    }
  }

  // TEST 5: Valid JPG file (small) → should pass validation (will fail at transaction lookup since fake ID, but that proves upload layer passed)
  try {
    const form = new FormData();
    form.append('transactionId', 'fake-tx-id');
    const smallJpg = Buffer.alloc(1024, 0xFF); // 1KB fake jpg
    form.append('paymentProof', smallJpg, {
      filename: 'receipt.jpg',
      contentType: 'image/jpeg'
    });
    const res = await axios.post(`${API}/transactions/fund`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    });
    console.log('❌ TEST 5: Unexpected success');
  } catch (e) {
    // We expect 404 (transaction not found) because the file passed validation
    if (e.response?.status === 404) {
      console.log(`✅ TEST 5 PASSED: Valid JPG passed upload validation → hit controller (404: "${e.response.data.error}")`);
    } else if (e.response?.status === 400) {
      console.log(`❌ TEST 5 FAILED: Valid JPG was rejected → "${e.response.data.error}"`);
    } else {
      console.log('❌ TEST 5 FAILED:', e.response?.status, e.response?.data || e.message);
    }
  }

  console.log('\n=== ALL UPLOAD VALIDATION TESTS COMPLETE ===');
}

test();
