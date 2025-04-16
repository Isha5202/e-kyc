import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://production.deepvue.tech';
const CLIENT_ID = process.env.DEEPVUE_CLIENT_ID!;
const CLIENT_SECRET = process.env.DEEPVUE_CLIENT_SECRET!;

let cachedToken: { token: string; fetchedAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now - cachedToken.fetchedAt < 24 * 60 * 60 * 1000) {
    return cachedToken.token;
  }

  try {
    const form = new URLSearchParams();
    form.append('client_id', CLIENT_ID);
    form.append('client_secret', CLIENT_SECRET);

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
  const headers = {
    'x-api-key': CLIENT_SECRET,
    'client-id': CLIENT_ID,
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
// Aadhaar OTP Verify (v2)
// Aadhaar OTP Verify (v2)
async function handleAadhaarVerifyOTP(params: any) {
    console.log("verify otp0");
    const headers = {
      'x-api-key': CLIENT_SECRET,
      'client-id': CLIENT_ID,
      'Content-Type': 'application/json',
    };
  
    const { otp, reference_id } = params;
  
    const url = `${BASE_URL}/v2/ekyc/aadhaar/verify-otp`;
  
    const res = await fetch(`${url}?otp=${encodeURIComponent(otp)}&reference_id=${encodeURIComponent(reference_id)}&consent=Y&purpose=ForKYC`, {
      method: 'POST',
      headers,
    });
  
    const raw = await res.text();
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('❌ Invalid Aadhaar OTP verification response:', raw);
      return { error: 'Invalid JSON response from Aadhaar OTP verify' };
    }
  }
  

// PAN
async function handlePan(params: any) {
    console.log("pan");
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Token fetch failed' };

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'x-api-key': CLIENT_SECRET,
    'Content-Type': 'application/json',
  };

  const url = `${BASE_URL}/v1/verification/pan-plus?pan_number=${params.pan_number}`;
  const res = await fetch(url, { method: 'GET', headers });
  return res.json();
}

// PAN-Aadhaar Link
async function handlePanAadhaarLink(params: any) {
    console.log("adhar link");
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Token fetch failed' };

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'x-api-key': CLIENT_SECRET,
    'Content-Type': 'application/json',
  };

  const url = `${BASE_URL}/v1/verification/pan-aadhaar-link-status?pan_number=${params.pan_number}&aadhaar_number=${params.aadhaar_number}`;
  const res = await fetch(url, { method: 'GET', headers });
  return res.json();
}

// Shared POST handler
// async function handleStandardPOST(url: string, params: any) {
//     console.log("std post");
//   const accessToken = await getAccessToken();
//   if (!accessToken) return { error: 'Token fetch failed' };

//   const headers = {
//     'Authorization': `Bearer ${accessToken}`,
//     'x-api-key': CLIENT_SECRET,
//     'Content-Type': 'application/json',
//   };

//   const res = await fetch(url, {
//     method: 'POST',
//     headers,
//     body: JSON.stringify(params),
//   });

//   const raw = await res.text();
//   try {
//     return JSON.parse(raw);
//   } catch {
//     return { error: `Invalid JSON from ${url}` };
//   }
// }

// DL (POST + GET)
async function handleDL(params: any) {
    console.log("dl");
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: 'Token fetch failed' };
  
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': CLIENT_SECRET,
      'Content-Type': 'application/json',
    };
  
    const postURL = `${BASE_URL}/v1/verification/post-driving-license?dl_number=${params.rc_number}&dob=${params.dob}`;
    const postRes = await fetch(postURL, { method: 'POST', headers });
    const postData = await postRes.json();
  
    if (!postData.request_id) return postData;
  
    const getURL = `${BASE_URL}/v1/verification/get-driving-license?request_id=${postData.request_id}`;
  
    // Retry polling with a delay
    let attempts = 0;
    const maxAttempts = 5;
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  
    while (attempts < maxAttempts) {
      const getRes = await fetch(getURL, { method: 'GET', headers });
      const getData = await getRes.json();
  
      if (getData[0]?.status !== "in_progress") {
        return getData;
      }
  
      await delay(2000); // wait 2 seconds before retry
      attempts++;
    }
  
    return { error: "Verification still in progress after multiple attempts" };
  }
  

// Voter ID (POST + GET)
async function handleVoterID(params: any) {
    console.log("vid");
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: 'Token fetch failed' };
  
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': CLIENT_SECRET,
      'Content-Type': 'application/json',
    };
  
    const postURL = `${BASE_URL}/v1/verification/post-voter-id?epic_number=${params.epic_number}`;
    const postRes = await fetch(postURL, { method: 'POST', headers });
    const postData = await postRes.json();
  
    if (!postData.request_id) return postData;
  
    const getURL = `${BASE_URL}/v1/verification/get-voter-id?request_id=${postData.request_id}`;
  
    // Retry polling with a delay
    let attempts = 0;
    const maxAttempts = 5;
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  
    while (attempts < maxAttempts) {
      const getRes = await fetch(getURL, { method: 'GET', headers });
      const getData = await getRes.json();
  
      if (getData[0]?.status !== "in_progress") {
        return getData;
      }
  
      await delay(2000); // wait 2 seconds before retry
      attempts++;
    }
  
    return { error: "Verification still in progress after multiple attempts" };
  }
  

// Passport
async function handlePassport(params: any) {
    console.log("passport");
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: 'Token fetch failed' };
  
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': CLIENT_SECRET,
      'Content-Type': 'application/json',
    };
  
    const url = `${BASE_URL}/v1/verification/passport?file_number=${params.file_number}&dob=${params.dob}`;
  
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });
  
    const data = await res.json();
    return data;
  }
  

// CIN
async function handleCIN(params: any) {
    console.log("cin");
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: 'Token fetch failed' };
  
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': CLIENT_SECRET,
      'Content-Type': 'application/json',
    };
  
    const url = `${BASE_URL}/v1/verification/mca/cin?id_number=${params.cin_number}`;
  
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });
  
    const data = await res.json();
    return data;
  }
  

// GST
async function handleGST(params: any) {
    console.log("gst");
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: 'Token fetch failed' };
  
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': CLIENT_SECRET,
      'Content-Type': 'application/json',
    };
  
    const url = `${BASE_URL}/v1/verification/gstinlite?gstin_number=${params.gstin_number}`;
  
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });
  
    const data = await res.json();
    return data;
  }
  

// FSSAI
async function handleFSSAI(params: any) {
    console.log("fssai");
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: 'Token fetch failed' };
  
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': CLIENT_SECRET,
      'Content-Type': 'application/json',
    };
  
    const url = `${BASE_URL}/v1/business-compliance/fssai-verification?fssai_id=${params.fssai_id}`;
  
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });
  
    const data = await res.json();
    return data;
  }
  

// Shopact
async function handleShopact(params: any) {
    console.log("shopact");
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: 'Token fetch failed' };
  
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': CLIENT_SECRET,
      'Content-Type': 'application/json',
    };
  
    const url = `${BASE_URL}/v1/business-compliance/shop-establishment-certificate?certificate_number=${params.certificate_number}&state_code=${params.state_code}`;
  
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });
  
    const data = await res.json();
    return data;
  }
  

// Udyam
async function handleUdyam(params: any) {
  console.log("udyam");
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Token fetch failed' };

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'x-api-key': CLIENT_SECRET,
    'Content-Type': 'application/json',
  };

  // 1. POST request to initiate Udyam verification
  const postURL = `${BASE_URL}/v1/verification/async/post-udyam-details?udyam_aadhaar_number=${params.udyam_aadhaar_number}`;
  const postRes = await fetch(postURL, { method: 'POST', headers });
  const postData = await postRes.json();

  if (!postData.request_id) return postData;

  // 2. GET request to poll the result
  const getURL = `${BASE_URL}/v1/verification/async/get-udyam-details?request_id=${postData.request_id}`;

  // Retry polling with delay
  let attempts = 0;
  const maxAttempts = 5;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  while (attempts < maxAttempts) {
    const getRes = await fetch(getURL, { method: 'GET', headers });
    const getData = await getRes.json();

    if (getData[0]?.status !== 'in_progress') {
      return getData;
    }

    await delay(2000); // wait 2 seconds before retry
    attempts++;
  }

  return { error: "Verification still in progress after multiple attempts" };
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
        return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('❌ Unexpected error in /api/kyc:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
