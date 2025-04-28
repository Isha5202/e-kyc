export async function getOverviewData() {
  const res = await fetch('http://192.168.1.71:3000/api/overview', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error("Failed to fetch overview data");
  }

  return res.json();
}
