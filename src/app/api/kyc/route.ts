import { NextRequest, NextResponse } from 'next/server';
import { getDeepvueCredentials } from '../settings/utils';

const BASE_URL = 'https://production.deepvue.tech';

let cachedToken: { token: string; fetchedAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now - cachedToken.fetchedAt < 24 * 60 * 60 * 1000) {
    return cachedToken.token;
  }

  try {
    const { client_id, client_secret } = await getDeepvueCredentials();
console.log('🔐 Credentials:', { client_id, client_secret });


    const form = new URLSearchParams();
    form.append('client_id', client_id);
    form.append('client_secret', client_secret);

    const res = await fetch(`${BASE_URL}/v1/authorize`, {
      method: 'POST',
      body: form,
    });

    const data = await res.json();
    if (data.access_token) {
      cachedToken = { token: data.access_token, fetchedAt: now };
      return data.access_token;
    }
    return null;
  } catch (err) {
    console.error('❌ Token error:', err);
    return null;
  }
}

// Aadhaar OTP Generate
async function handleAadhaarGenerateOTP(params: any) {
  const { client_id, client_secret } = await getDeepvueCredentials();

  const headers = {
    'x-api-key': client_secret,
    'client-id': client_id,
    'Content-Type': 'application/json',
  };

  const url = `${BASE_URL}/v2/ekyc/aadhaar/generate-otp?aadhaar_number=${params.aadhaar_number}&consent=Y&purpose=ForKYC`;
  const res = await fetch(url, { method: 'POST', headers });

  const raw = await res.text();
  try {
    return JSON.parse(raw);
  } catch {
    return { error: 'Invalid JSON response from Aadhaar OTP generate' };
  }
}

// Aadhaar OTP Verify
async function handleAadhaarVerifyOTP(params: any) {
  const { client_id, client_secret } = await getDeepvueCredentials();

  const headers = {
    'x-api-key': client_secret,
    'client-id': client_id,
    'Content-Type': 'application/json',
  };

  const { otp, reference_id } = params;

  const url = `${BASE_URL}/v2/ekyc/aadhaar/verify-otp`;

  const res = await fetch(
    `${url}?otp=${encodeURIComponent(otp)}&reference_id=${encodeURIComponent(reference_id)}&consent=Y&purpose=ForKYC`,
    { method: 'POST', headers }
  );

  const raw = await res.text();
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('❌ Invalid Aadhaar OTP verification response:', raw);
    return { error: 'Invalid JSON response from Aadhaar OTP verify' };
  }
}

// Shared GET handler
async function getAuthHeaders(): Promise<any> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const { client_secret } = await getDeepvueCredentials();

  return {
    Authorization: `Bearer ${accessToken}`,
    'x-api-key': client_secret,
    'Content-Type': 'application/json',
  };
}

async function handlePan(params: any) {
  const headers = await getAuthHeaders();
  if (!headers) return { error: 'Token fetch failed' };

  const url = `${BASE_URL}/v1/verification/pan-plus?pan_number=${params.pan_number}`;
  const res = await fetch(url, { method: 'GET', headers });
  return res.json();
}

async function handlePanAadhaarLink(params: any) {
  const headers = await getAuthHeaders();
  if (!headers) return { error: 'Token fetch failed' };

  const url = `${BASE_URL}/v1/verification/pan-aadhaar-link-status?pan_number=${params.pan_number}&aadhaar_number=${params.aadhaar_number}`;
  const res = await fetch(url, { method: 'GET', headers });
  return res.json();
}

async function handleDL(params: any) {
  const headers = await getAuthHeaders();
  if (!headers) return { error: 'Token fetch failed' };

  const postURL = `${BASE_URL}/v1/verification/post-driving-license?dl_number=${params.rc_number}&dob=${params.dob}`;
  const postRes = await fetch(postURL, { method: 'POST', headers });
  const postData = await postRes.json();

  if (!postData.request_id) return postData;

  const getURL = `${BASE_URL}/v1/verification/get-driving-license?request_id=${postData.request_id}`;

  let attempts = 0;
  const maxAttempts = 5;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  while (attempts < maxAttempts) {
    const getRes = await fetch(getURL, { method: 'GET', headers });
    const getData = await getRes.json();

    if (getData[0]?.status !== 'in_progress') {
      return getData;
    }

    await delay(2000);
    attempts++;
  }

  return { error: 'Verification still in progress after multiple attempts' };
}

async function handleVoterID(params: any) {
  const headers = await getAuthHeaders();
  if (!headers) return { error: 'Token fetch failed' };

  const postURL = `${BASE_URL}/v1/verification/post-voter-id?epic_number=${params.epic_number}`;
  const postRes = await fetch(postURL, { method: 'POST', headers });
  const postData = await postRes.json();

  if (!postData.request_id) return postData;

  const getURL = `${BASE_URL}/v1/verification/get-voter-id?request_id=${postData.request_id}`;

  let attempts = 0;
  const maxAttempts = 5;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  while (attempts < maxAttempts) {
    const getRes = await fetch(getURL, { method: 'GET', headers });
    const getData = await getRes.json();

    if (getData[0]?.status !== 'in_progress') {
      return getData;
    }

    await delay(2000);
    attempts++;
  }

  return { error: 'Verification still in progress after multiple attempts' };
}

async function handlePassport(params: any) {
  const headers = await getAuthHeaders();
  if (!headers) return { error: 'Token fetch failed' };

  const url = `${BASE_URL}/v1/verification/passport?file_number=${params.file_number}&dob=${params.dob}`;
  const res = await fetch(url, { method: 'GET', headers });
  return res.json();
}

async function handleCIN(params: any) {
  const headers = await getAuthHeaders();
  if (!headers) return { error: 'Token fetch failed' };

  const url = `${BASE_URL}/v1/verification/mca/cin?id_number=${params.cin_number}`;
  const res = await fetch(url, { method: 'GET', headers });
  return res.json();
}

async function handleGST(params: any) {
  const headers = await getAuthHeaders();
  if (!headers) return { error: 'Token fetch failed' };

  const url = `${BASE_URL}/v1/verification/gstinlite?gstin_number=${params.gstin_number}`;
  const res = await fetch(url, { method: 'GET', headers });
  return res.json();
}

async function handleFSSAI(params: any) {
  const headers = await getAuthHeaders();
  if (!headers) return { error: 'Token fetch failed' };

  const url = `${BASE_URL}/v1/business-compliance/fssai-verification?fssai_id=${params.fssai_id}`;
  const res = await fetch(url, { method: 'GET', headers });
  return res.json();
}

async function handleShopact(params: any) {
  const headers = await getAuthHeaders();
  if (!headers) return { error: 'Token fetch failed' };

  const url = `${BASE_URL}/v1/business-compliance/shop-establishment-certificate?certificate_number=${params.certificate_number}&state_code=${params.state_code}`;
  const res = await fetch(url, { method: 'GET', headers });
  return res.json();
}

async function handleUdyam(params: any) {
  const headers = await getAuthHeaders();
  if (!headers) return { error: 'Token fetch failed' };

  const postURL = `${BASE_URL}/v1/verification/async/post-udyam-details?udyam_aadhaar_number=${params.udyam_aadhaar_number}`;
  const postRes = await fetch(postURL, { method: 'POST', headers });
  const postData = await postRes.json();

  if (!postData.request_id) return postData;

  const getURL = `${BASE_URL}/v1/verification/async/get-udyam-details?request_id=${postData.request_id}`;

  let attempts = 0;
  const maxAttempts = 5;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  while (attempts < maxAttempts) {
    const getRes = await fetch(getURL, { method: 'GET', headers });
    const getData = await getRes.json();

    if (getData[0]?.status !== 'in_progress') {
      return getData;
    }

    await delay(2000);
    attempts++;
  }

  return { error: 'Verification still in progress after multiple attempts' };
}

// Main API Route
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...params } = body;

    let data;

    switch (type) {
      case 'aadhar':
        data = await handleAadhaarGenerateOTP(params);
        break;
      case 'aadhar-verify':
        data = await handleAadhaarVerifyOTP(params);
        break;
      case 'pan':
        data = await handlePan(params);
        break;
      case 'pan-aadhaar-link':
        data = await handlePanAadhaarLink(params);
        break;
      case 'dl':
        data = await handleDL(params);
        break;
      case 'voter':
        data = await handleVoterID(params);
        break;
      case 'passport':
        data = await handlePassport(params);
        break;
      case 'cin':
        data = await handleCIN(params);
        break;
      case 'gst':
        data = await handleGST(params);
        break;
      case 'fssai':
        data = await handleFSSAI(params);
        break;
      case 'shopact':
        data = await handleShopact(params);
        break;
      case 'udyam':
        data = await handleUdyam(params);
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('❌ KYC POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
