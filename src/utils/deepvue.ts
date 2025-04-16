export const allowedTypes = [
    'pan', 'aadhar', 'aadhar-otp', 'aadhar-verify-otp', 'cin', 'gst', 'dl',
    'fssai', 'shopact', 'udyam', 'voter', 'passport', 'linking',
  ];
  
  export function getKycConfig(type: string) {
    console.log('[getKycConfig] Requested type:', type);
  
    const map: Record<string, any> = {
      pan: {
        url: ({ pan_number, name }: any) => {
          console.log('[pan] URL params:', { pan_number, name });
          return `https://production.deepvue.tech/v1/verification/panbasic?pan_number=${pan_number}&name=${encodeURIComponent(name)}`;
        },
        method: 'GET',
      },
      aadhar: {
        url: 'https://production.deepvue.tech/v2/ekyc/aadhaar/generate-otp',
        method: 'POST',
      },
      'aadhar-verify-otp': {
        url: 'https://production.deepvue.tech/v2/ekyc/aadhaar/verify-otp',
        method: 'POST',
      },
      cin: {
        url: ({ id_number }: any) => {
          console.log('[cin] URL param:', id_number);
          return `https://production.deepvue.tech/v1/verification/mca/cin?id_number=${id_number}`;
        },
        method: 'GET',
      },
      gst: {
        url: ({ gstin_number }: any) => {
          console.log('[gst] URL param:', gstin_number);
          return `https://production.deepvue.tech/v1/verification/gstinlite?gstin_number=${gstin_number}`;
        },
        method: 'GET',
      },
      dl: {
        url: ({ rc_number }: any) => {
          console.log('[dl] URL param:', rc_number);
          return `https://production.deepvue.tech/v1/verification/post-vehicle-rc?rc_number=${rc_number}`;
        },
        method: 'GET',
      },
      voter: {
        url: ({ epic_number }: any) => {
          console.log('[voter] URL param:', epic_number);
          return `https://production.deepvue.tech/v1/verification/post-voter-id?epic_number=${epic_number}`;
        },
        method: 'GET',
      },
      passport: {
        url: ({ file_number, dob }: any) => {
          console.log('[passport] URL params:', { file_number, dob });
          return `https://production.deepvue.tech/v1/verification/passport?file_number=${file_number}&dob=${dob}`;
        },
        method: 'GET',
      },
      linking: {
        url: ({ pan_number, aadhaar_number }: any) => {
          console.log('[linking] URL params:', { pan_number, aadhaar_number });
          return `https://production.deepvue.tech/v1/verification/pan-aadhaar-link-status?pan_number=${pan_number}&aadhaar_number=${aadhaar_number}`;
        },
        method: 'GET',
      },
      udyam: {
        url: 'https://production.deepvue.tech/v1/verification/async/post-udyam-details',
        method: 'POST',
        payloadBuilder: ({ udyam_aadhaar_number }: any) => {
          console.log('[udyam] Payload:', { udyam_aadhaar_number });
          return { udyam_aadhaar_number };
        },
      },
      fssai: {
        url: ({ fssai_id }: any) => {
          console.log('[fssai] URL param:', fssai_id);
          return `https://production.deepvue.tech/v1/business-compliance/fssai-verification?fssai_id=${fssai_id}`;
        },
        method: 'GET',
      },
      shopact: {
        url: ({ certificate_number, state_code }: any) => {
          console.log('[shopact] URL params:', { certificate_number, state_code });
          return `https://production.deepvue.tech/v1/business-compliance/shop-establishment-certificate?certificate_number=${certificate_number}&state_code=${state_code}`;
        },
        method: 'GET',
      },
    };
  
    const config = map[type];
    if (!config) console.warn('[getKycConfig] Unknown type:', type);
    else console.log('[getKycConfig] Resolved config for type:', config);
  
    return config;
  }
  
  export async function getAccessToken(clientId: string, clientSecret: string) {
    console.log('[getAccessToken] Requesting access token with:', { clientId });
  
    try {
      const res = await fetch('https://auth.deepvue.tech/v1/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': clientSecret,
        },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
      });
  
      console.log('[getAccessToken] Response status:', res.status);
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[getAccessToken] Auth failed:', errorText);
        throw new Error(`Auth failed: ${errorText}`);
      }
  
      const json = await res.json();
      console.log('[getAccessToken] Received access token:', json.access_token);
  
      return json.access_token;
    } catch (err) {
      console.error('[getAccessToken] Error:', err);
      throw err;
    }
  }
  