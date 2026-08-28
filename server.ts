import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { handleInsightRequest } from "./api/insight.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Horizon Planner", timestamp: new Date().toISOString() });
  });

  // Gemini AI Travel Insight API
  app.post("/api/insight", handleInsightRequest);

  // Holiday Proxy - Available Countries
  app.get("/api/holidays/countries", async (req, res) => {
    try {
      const response = await fetch("https://date.nager.at/api/v3/AvailableCountries");
      if (!response.ok) throw new Error(`Nager API status: ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.warn("Could not fetch countries from Nager API, serving fallback list:", err);
      res.json(getFallbackCountries());
    }
  });

  // Holiday Proxy - Is Today Public Holiday
  app.get("/api/holidays/is-today/:countryCode", async (req, res) => {
    const { countryCode } = req.params;
    try {
      const response = await fetch(`https://date.nager.at/api/v3/IsTodayPublicHoliday/${countryCode}`);
      // Nager returns 200 (is holiday), 204 (not a holiday), or 404 (country not supported)
      if (response.status === 200) {
        return res.json({ isTodayHoliday: true, status: 200 });
      } else if (response.status === 204) {
        return res.json({ isTodayHoliday: false, status: 204 });
      } else {
        return res.json({ isTodayHoliday: false, status: response.status });
      }
    } catch (err) {
      console.warn(`Could not check IsTodayPublicHoliday for ${countryCode}:`, err);
      res.json({ isTodayHoliday: false, status: 204 });
    }
  });

  // Holiday Proxy - Next Public Holidays for a specific country
  app.get("/api/holidays/next/:countryCode", async (req, res) => {
    const { countryCode } = req.params;
    try {
      const response = await fetch(`https://date.nager.at/api/v3/NextPublicHolidays/${countryCode}`);
      if (!response.ok) throw new Error(`Nager API status: ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.warn(`Could not fetch next holidays for ${countryCode}:`, err);
      const currentYear = new Date().getFullYear();
      const allHolidays = getFallbackHolidays(countryCode, currentYear);
      const todayStr = new Date().toISOString().split("T")[0];
      const upcoming = allHolidays.filter(h => h.date >= todayStr);
      res.json(upcoming);
    }
  });

  // Holiday Proxy - Public Holidays by Year and CountryCode
  app.get("/api/holidays/:year/:countryCode", async (req, res) => {
    const { year, countryCode } = req.params;
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
      if (!response.ok) throw new Error(`Nager API status: ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.warn(`Could not fetch holidays for ${countryCode} ${year}, serving fallback:`, err);
      res.json(getFallbackHolidays(countryCode, parseInt(year, 10)));
    }
  });

  // Holiday Proxy - Long Weekends
  app.get("/api/holidays/long-weekends/:year/:countryCode", async (req, res) => {
    const { year, countryCode } = req.params;
    try {
      const response = await fetch(`https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`);
      if (!response.ok) throw new Error(`Nager API status: ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.warn(`Could not fetch long weekends for ${countryCode} ${year}:`, err);
      res.json(getFallbackLongWeekends(countryCode, parseInt(year, 10)));
    }
  });

  // Holiday Proxy - Worldwide Upcoming Holidays
  app.get("/api/holidays/upcoming", async (req, res) => {
    try {
      const response = await fetch("https://date.nager.at/api/v3/NextPublicHolidaysWorldwide");
      if (!response.ok) throw new Error(`Nager API status: ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.warn("Could not fetch upcoming holidays, serving fallback:", err);
      res.json(getFallbackUpcomingHolidays());
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Horizon Planner running on http://localhost:${PORT}`);
  });
}

function getFallbackCountries() {
  return [
    { countryCode: "SG", name: "Singapore" },
    { countryCode: "JP", name: "Japan" },
    { countryCode: "KR", name: "South Korea" },
    { countryCode: "TH", name: "Thailand" },
    { countryCode: "VN", name: "Vietnam" },
    { countryCode: "MY", name: "Malaysia" },
    { countryCode: "ID", name: "Indonesia" },
    { countryCode: "AU", name: "Australia" },
    { countryCode: "NZ", name: "New Zealand" },
    { countryCode: "GB", name: "United Kingdom" },
    { countryCode: "US", name: "United States" },
    { countryCode: "FR", name: "France" },
    { countryCode: "IT", name: "Italy" },
    { countryCode: "DE", name: "Germany" },
    { countryCode: "ES", name: "Spain" },
    { countryCode: "CH", name: "Switzerland" },
    { countryCode: "CA", name: "Canada" },
    { countryCode: "TW", name: "Taiwan" },
    { countryCode: "HK", name: "Hong Kong" },
    { countryCode: "CN", name: "China" }
  ];
}

function getFallbackHolidays(countryCode: string, year: number) {
  const y = year || 2026;
  const holidays: Record<string, Array<any>> = {
    SG: [
      { date: `${y}-01-01`, localName: "New Year's Day", name: "New Year's Day", countryCode: "SG", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-02-17`, localName: "Chinese New Year", name: "Chinese New Year", countryCode: "SG", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-02-18`, localName: "Second Day of Chinese New Year", name: "Second Day of Chinese New Year", countryCode: "SG", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-03-20`, localName: "Hari Raya Puasa", name: "Hari Raya Puasa", countryCode: "SG", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-04-03`, localName: "Good Friday", name: "Good Friday", countryCode: "SG", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-05-01`, localName: "Labour Day", name: "Labour Day", countryCode: "SG", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-05-31`, localName: "Vesak Day", name: "Vesak Day", countryCode: "SG", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-05-27`, localName: "Hari Raya Haji", name: "Hari Raya Haji", countryCode: "SG", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-08-09`, localName: "National Day", name: "National Day", countryCode: "SG", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-11-08`, localName: "Deepavali", name: "Deepavali", countryCode: "SG", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-12-25`, localName: "Christmas Day", name: "Christmas Day", countryCode: "SG", fixed: true, global: true, types: ["Public"] }
    ],
    JP: [
      { date: `${y}-01-01`, localName: "元日", name: "New Year's Day", countryCode: "JP", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-01-12`, localName: "成人の日", name: "Coming of Age Day", countryCode: "JP", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-02-11`, localName: "建国記念の日", name: "National Foundation Day", countryCode: "JP", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-02-23`, localName: "天皇誕生日", name: "Emperor's Birthday", countryCode: "JP", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-03-20`, localName: "春分の日", name: "Vernal Equinox Day", countryCode: "JP", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-04-29`, localName: "昭和の日", name: "Showa Day", countryCode: "JP", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-05-03`, localName: "憲法記念日", name: "Constitution Memorial Day", countryCode: "JP", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-05-04`, localName: "みどりの日", name: "Greenery Day", countryCode: "JP", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-05-05`, localName: "こどもの日", name: "Children's Day", countryCode: "JP", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-07-20`, localName: "海の日", name: "Marine Day", countryCode: "JP", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-08-11`, localName: "山の日", name: "Mountain Day", countryCode: "JP", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-09-21`, localName: "敬老の日", name: "Respect for the Aged Day", countryCode: "JP", fixed: false, global: true, types: ["Public"] },
      { date: `${y}-11-03`, localName: "文化の日", name: "Culture Day", countryCode: "JP", fixed: true, global: true, types: ["Public"] },
      { date: `${y}-11-23`, localName: "勤労感謝の日", name: "Labor Thanksgiving Day", countryCode: "JP", fixed: true, global: true, types: ["Public"] }
    ]
  };

  return holidays[countryCode] || [
    { date: `${y}-01-01`, localName: "New Year's Day", name: "New Year's Day", countryCode: countryCode, fixed: true, global: true, types: ["Public"] },
    { date: `${y}-05-01`, localName: "Labour Day", name: "Labour Day", countryCode: countryCode, fixed: true, global: true, types: ["Public"] },
    { date: `${y}-12-25`, localName: "Christmas Day", name: "Christmas Day", countryCode: countryCode, fixed: true, global: true, types: ["Public"] }
  ];
}

function getFallbackLongWeekends(countryCode: string, year: number) {
  const y = year || 2026;
  return [
    { startDate: `${y}-01-01`, endDate: `${y}-01-04`, dayCount: 4, needBridgeDay: true, bridgeDays: [`${y}-01-02`] },
    { startDate: `${y}-04-03`, endDate: `${y}-04-06`, dayCount: 4, needBridgeDay: false },
    { startDate: `${y}-05-01`, endDate: `${y}-05-03`, dayCount: 3, needBridgeDay: false },
    { startDate: `${y}-08-07`, endDate: `${y}-08-10`, dayCount: 4, needBridgeDay: true, bridgeDays: [`${y}-08-10`] },
    { startDate: `${y}-12-25`, endDate: `${y}-12-28`, dayCount: 4, needBridgeDay: true, bridgeDays: [`${y}-12-28`] }
  ];
}

function getFallbackUpcomingHolidays() {
  const today = new Date();
  const y = today.getFullYear();
  return [
    { date: `${y}-09-21`, localName: "敬老の日", name: "Respect for the Aged Day", countryCode: "JP" },
    { date: `${y}-10-12`, localName: "Sports Day", name: "Sports Day", countryCode: "JP" },
    { date: `${y}-11-08`, localName: "Deepavali", name: "Deepavali", countryCode: "SG" },
    { date: `${y}-11-26`, localName: "Thanksgiving Day", name: "Thanksgiving Day", countryCode: "US" },
    { date: `${y}-12-25`, localName: "Christmas Day", name: "Christmas Day", countryCode: "GB" }
  ];
}

startServer();
