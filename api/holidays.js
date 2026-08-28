// Vercel Serverless Function - Nager.Date API Proxy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url = '' } = req;
  const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  try {
    // 1. Available Countries
    if (pathname.includes('/countries') || searchParams.get('action') === 'countries') {
      const resp = await fetch('https://date.nager.at/api/v3/AvailableCountries');
      if (!resp.ok) throw new Error(`Nager API status ${resp.status}`);
      const data = await resp.json();
      return res.status(200).json(data);
    }

    // 2. Is Today Public Holiday
    const isTodayMatch = pathname.match(/\/is-today\/([A-Za-z]{2})/i);
    const isTodayParam = searchParams.get('isToday');
    const todayCountry = (isTodayMatch && isTodayMatch[1]) || isTodayParam;
    if (todayCountry) {
      const resp = await fetch(`https://date.nager.at/api/v3/IsTodayPublicHoliday/${todayCountry.toUpperCase()}`);
      if (resp.status === 200) {
        return res.status(200).json({ isTodayHoliday: true, status: 200 });
      } else {
        return res.status(200).json({ isTodayHoliday: false, status: resp.status });
      }
    }

    // 3. Next Public Holidays
    const nextMatch = pathname.match(/\/next\/([A-Za-z]{2})/i);
    const nextParam = searchParams.get('next');
    const nextCountry = (nextMatch && nextMatch[1]) || nextParam;
    if (nextCountry) {
      const resp = await fetch(`https://date.nager.at/api/v3/NextPublicHolidays/${nextCountry.toUpperCase()}`);
      if (!resp.ok) throw new Error(`Nager API status ${resp.status}`);
      const data = await resp.json();
      return res.status(200).json(data);
    }

    // 4. Long Weekend
    const lwMatch = pathname.match(/\/long-weekends?\/(\d{4})\/([A-Za-z]{2})/i);
    if (lwMatch) {
      const year = lwMatch[1];
      const country = lwMatch[2].toUpperCase();
      const resp = await fetch(`https://date.nager.at/api/v3/LongWeekend/${year}/${country}`);
      if (!resp.ok) throw new Error(`Nager API status ${resp.status}`);
      const data = await resp.json();
      return res.status(200).json(data);
    }

    // 5. Public Holidays by Year and Country
    const pubMatch = pathname.match(/\/(\d{4})\/([A-Za-z]{2})/i);
    const queryYear = searchParams.get('year');
    const queryCountry = searchParams.get('country') || searchParams.get('countryCode');
    const year = (pubMatch && pubMatch[1]) || queryYear || new Date().getFullYear();
    const country = (pubMatch && pubMatch[2]?.toUpperCase()) || (queryCountry && queryCountry.toUpperCase()) || 'JP';

    const resp = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`);
    if (!resp.ok) throw new Error(`Nager API status ${resp.status}`);
    const data = await resp.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Holiday API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch holiday data' });
  }
}
