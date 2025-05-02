interface OverviewData {
  users: number;
  branches: number;
  kyc: number;
}

export async function getOverviewData(): Promise<OverviewData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch('/api/overview', {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId); // always clear immediately after fetch finishes

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();

    return {
      users: Number(data.users) || 0,
      branches: Number(data.branches) || 0,
      kyc: Number(data.kyc) || 0,
    };
  } catch (error) {
    clearTimeout(timeoutId); // also clear on error

    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error("Request timed out.");
      throw new Error("Request timed out while fetching overview data");
    }

    if (error instanceof Error) {
      console.error("Error fetching overview data:", error.message);
      throw new Error(error.message);
    }

    console.error("Unknown error:", error);
    throw new Error("Unknown error occurred while fetching overview data");
  }
}
