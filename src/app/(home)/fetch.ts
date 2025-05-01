// src/app/(home)/fetch.ts
interface OverviewData {
  users: number;
  branches: number;
  kyc: number;
}

export async function getOverviewData(): Promise<OverviewData> {
  try {
    const res = await fetch('http://192.168.58.102:3000/api/overview', {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();
    
    // Validate and convert response
    const result = {
      users: Number(data.users) || 0,
      branches: Number(data.branches) || 0,
      kyc: Number(data.kyc) || 0,
    };

    return result;
  } catch (error) {
    console.error('Error fetching overview data:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch overview data'
    );
  }
}