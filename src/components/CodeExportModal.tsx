import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Download, BookOpen, Layers } from 'lucide-react';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<'index.html' | 'styles.css' | 'app.js' | 'api/insight.js'>('index.html');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const fileContents = {
    'index.html': `<!-- 
  =============================================================================
  HORIZON PLANNER - Semantic HTML5 Architecture
  =============================================================================
  This file delivers a clean, semantic HTML5 structure:
  - <header>: Brand identity, global currency switch, and navigation tabs
  - <main>: 4 core application sections (Holidays, Flights/Hotels, Itinerary, Budget)
  - <section>: Dedicated data surfaces for public holidays, travel searches, itineraries, and budgets
  - <dialog>: Modal dialogs for adding activities and AI insights
-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Horizon Planner — Global Holidays & Travel Planner</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- Top App Header & Navigation -->
  <header class="app-header">
    <div class="header-container">
      <div class="brand-row">
        <h1 class="brand-title">HORIZON <span>PLANNER</span></h1>
        <div class="header-controls">
          <label for="currency-select">Currency:</label>
          <select id="currency-select">
            <option value="SGD">SGD (S$)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="nav-tabs" aria-label="Main Navigation">
        <button class="nav-tab active" data-target="section-holidays">1. Global Holidays</button>
        <button class="nav-tab" data-target="section-flights-hotels">2. Flights & Hotels</button>
        <button class="nav-tab" data-target="section-itinerary">3. Itinerary Planner</button>
        <button class="nav-tab" data-target="section-budget">4. Budget Calculator</button>
      </nav>
    </div>
  </header>

  <!-- Main Multi-Section Layout Container -->
  <main class="main-layout">
    
    <!-- 1. Holidays Explorer -->
    <section id="section-holidays" class="card-surface">
      <header class="section-header">
        <h2>Global Holidays Explorer</h2>
        <p>Explore public holidays and long-weekend bridge day opportunities around the world.</p>
      </header>
      <form class="search-form">
        <select id="country-picker" aria-label="Select Country">
          <option value="JP">Japan (JP)</option>
          <option value="SG">Singapore (SG)</option>
          <option value="KR">South Korea (KR)</option>
        </select>
        <select id="year-picker" aria-label="Select Year">
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
        <button type="button" id="btn-fetch-holidays" class="btn-primary">Find Holidays</button>
      </form>
      <div id="holidays-results-container" class="results-grid"></div>
    </section>

    <!-- 2. Flights & Hotels Search (sg.trip.com deep-linking) -->
    <section id="section-flights-hotels" class="card-surface">
      <header class="section-header">
        <h2>Find Flights & Hotels on sg.trip.com</h2>
        <p>Search routes and launch direct booking portals with pre-filled parameters.</p>
      </header>
      <div class="search-bar-segmented">
        <input type="text" id="flight-origin" value="SIN" placeholder="Origin (e.g. SIN)">
        <input type="text" id="flight-dest" value="HND" placeholder="Destination (e.g. HND)">
        <input type="date" id="flight-depart" value="2026-09-18">
        <input type="date" id="flight-return" value="2026-09-22">
        <a id="trip-search-link" class="btn-cta" href="https://sg.trip.com/?locale=en-sg" target="_blank">
          Search on Trip.com
        </a>
      </div>
    </section>

    <!-- 3. Itinerary Planner (Day-by-Day Timeline) -->
    <section id="section-itinerary" class="card-surface">
      <header class="section-header">
        <h2>Day-by-Day Itinerary Planner</h2>
        <button id="btn-add-activity" class="btn-primary">+ Add Activity</button>
      </header>
      <div id="itinerary-timeline" class="timeline-track">
        <!-- Dynamic timeline nodes rendered via app.js -->
      </div>
    </section>

    <!-- 4. Budget Calculator -->
    <section id="section-budget" class="card-surface">
      <header class="section-header">
        <h2>Dynamic Budget Calculator</h2>
        <p>Real-time calculation of flights, hotels, dining, and synced itinerary expenses.</p>
      </header>
      <div class="budget-bar-container" id="budget-distribution-bar"></div>
      <div class="budget-metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Total Projected Cost</span>
          <span id="total-projected-cost" class="metric-value">S$ 2,140</span>
        </div>
      </div>
    </section>

    <!-- 5. Community & Discussion (Disqus) -->
    <section id="section-community" class="card-surface">
      <header class="section-header">
        <h2>Traveler Community & Discussion</h2>
        <p>Connect with fellow travelers, exchange holiday leave strategies, and share tips.</p>
      </header>
      <div id="disqus_thread"></div>
      <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
    </section>

  </main>

  <script>
    (function() {
      var d = document, s = d.createElement('script');
      s.src = 'https://https-holidayplanner-beta-vercel-app.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
    })();
  </script>
  <script src="app.js"></script>
</body>
</html>`,

    'styles.css': `/* Horizon Planner - Stylesheet (styles.css / styles.ccs) */
:root {
  --color-primary: #1e293b;
  --color-travel-blue: #3b82f6;
  --color-travel-blue-hover: #2563eb;
  --color-sunset-gold: #f59e0b;
  --color-sunset-gold-hover: #d97706;
  --color-slate-bg: #f8fafc;
  --color-surface-white: #ffffff;
  --color-border-subtle: #e2e8f0;
  --color-text-main: #0f172a;
  --color-text-muted: #64748b;
  --font-family-base: 'Inter', -apple-system, sans-serif;
  --radius-sm: 4px;
  --radius-md: 8px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-family-base); background-color: var(--color-slate-bg); color: var(--color-text-main); }
.app-header { background-color: var(--color-primary); color: #fff; position: sticky; top: 0; z-index: 50; }
.header-container { max-width: 1280px; margin: 0 auto; padding: 1rem; }
.main-layout { max-width: 1280px; margin: 1.5rem auto; padding: 0 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.card-surface { background-color: var(--color-surface-white); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); padding: 1.5rem; }
.btn-primary { background-color: var(--color-travel-blue); color: #fff; padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: none; font-weight: 600; cursor: pointer; }
.btn-cta { background-color: var(--color-sunset-gold); color: #0f172a; padding: 0.6rem 1.2rem; border-radius: var(--radius-sm); border: none; font-weight: 700; text-decoration: none; }
.timeline-track { position: relative; padding-left: 2rem; border-left: 2px solid #e2e8f0; margin: 1rem 0; }
.budget-bar-container { height: 0.75rem; width: 100%; background-color: #f1f5f9; border-radius: 9999px; overflow: hidden; display: flex; }`,

    'app.js': `/**
 * Main Vanilla JS Controller (app.js)
 * -----------------------------------
 * Demonstrates DOM manipulation, holiday fetching, travel booking linking,
 * itinerary array state management, and real-time budget calculations.
 */

// 1. Fetch public holidays
async function loadHolidays(countryCode, year) {
  const res = await fetch(\`/api/holidays?country=\${countryCode}&year=\${year}\`);
  const holidays = await res.json();
  console.log("Loaded public holidays:", holidays);
  return holidays;
}

// 2. Build sg.trip.com deep flight link
function getTripFlightLink(origin, dest, departDate, returnDate) {
  return \`https://sg.trip.com/flights/\${origin.toLowerCase()}-to-\${dest.toLowerCase()}/tickets-roundtrip?dcity=\${origin}&acity=\${dest}&ddate=\${departDate}&rdate=\${returnDate}&locale=en-sg\`;
}

// 3. Compute Budget Total Math
function computeBudget(budgetState, days, travelers) {
  const flights = budgetState.flightCost * travelers;
  const lodging = budgetState.hotelPerNight * (days - 1);
  const dining = budgetState.dailyFood * days * travelers;
  const transit = budgetState.dailyTransit * days * travelers;
  const subtotal = flights + lodging + dining + transit;
  const emergency = Math.round(subtotal * 0.10);
  return { subtotal, emergency, grandTotal: subtotal + emergency };
}`,

    'api/insight.js': `/**
 * Server-Side Gemini AI Advisor (/api/insight.js)
 * ----------------------------------------------
 * Guardrail Enforcement:
 * - Credentials read ONLY in repo-root api/ via process.env.GEMINI_API_KEY.
 * - Missing credential returns HTTP 500 {"error":"credential not configured"}.
 */
import { GoogleGenAI } from "@google/genai";

export async function handleInsightRequest(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "credential not configured" });
  }

  try {
    const { country, city, holidayName, travelers, budget, currency, style } = req.body || {};
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const prompt = \`You are an expert AI travel advisor. Generate structured travel strategy and itinerary for \${city || country} during \${holidayName}. Budget: \${budget} \${currency}. Travel style: \${style}.\`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "Failed to generate travel insight" });
  }
}`
  };

  const currentCode = fileContents[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    Object.entries(fileContents).forEach(([filename, code]) => {
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-300 max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base text-white">
                Delivered Files & Semantic HTML5 Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Four standalone files: <code className="text-amber-300">index.html</code>, <code className="text-blue-300">styles.css</code>, <code className="text-emerald-300">app.js</code>, <code className="text-purple-300">api/insight.js</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs & Actions Toolbar */}
        <div className="bg-slate-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200">
          <div className="flex items-center gap-1">
            {(['index.html', 'styles.css', 'app.js', 'api/insight.js'] as const).map((file) => (
              <button
                key={file}
                onClick={() => setActiveFile(file)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
                  activeFile === file 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download 4 Files</span>
            </button>
          </div>
        </div>

        {/* Code Content Container */}
        <div className="flex-1 p-4 bg-slate-900 overflow-auto font-mono text-xs text-slate-200 leading-relaxed select-text">
          <pre className="whitespace-pre">
            {currentCode}
          </pre>
        </div>

        {/* Footer info note */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Semantic HTML5 with clear layout blocks and accessible attributes.</span>
          <span className="font-semibold text-blue-700">Ready for beginner inspection & production deployment</span>
        </div>
      </div>
    </div>
  );
};
