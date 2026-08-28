/**
 * API Insight Handler: /api/insight
 * Generates AI-assisted travel advice, holiday bridging strategies,
 * day-by-day itineraries, and budget tips using Gemini AI.
 *
 * Guardrail Enforcement:
 * - Credentials are read ONLY inside repo-root api/ directory via process.env.GEMINI_API_KEY.
 * - Never create a VITE_ variable for a secret.
 * - Never hardcode a key, token, URL with a key, or credential JSON.
 * - If credential is missing at runtime, return HTTP 500 with {"error":"credential not configured"}.
 */
import { GoogleGenAI } from "@google/genai";

export async function handleInsightRequest(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "credential not configured" });
  }

  try {
    const {
      country = "Japan",
      city = "",
      holidayName = "Public Holiday",
      startDate = "",
      endDate = "",
      travelers = 1,
      budget = 1500,
      currency = "SGD",
      style = "Balanced Explorer",
      requestType = "general",
      customPrompt = ""
    } = req.body || {};

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `You are Horizon Planner's expert AI travel advisor. Generate an insightful, professional, and practical travel guide & itinerary for a trip around public holidays.

Trip Details:
- Destination: ${city ? `${city}, ` : ''}${country}
- Associated Public Holiday: ${holidayName || 'Standard Vacation'}
- Dates: ${startDate || 'Upcoming Holiday Period'} to ${endDate || 'Flexible'}
- Number of Travelers: ${travelers}
- Target Budget: ${budget} ${currency}
- Travel Style: ${style}
- Request Focus: ${requestType}
${customPrompt ? `- Custom User Focus: ${customPrompt}` : ''}

Provide a structured, engaging, and high-value response in JSON format matching this schema:
{
  "summary": "2-3 sentences summarizing the destination allure, holiday atmosphere, and top strategic recommendation for this timeframe.",
  "recommendations": [
    "Strategic tip 1 (e.g., flight booking window or leave bridge trick)",
    "Strategic tip 2 (e.g., local crowd management during public holiday)",
    "Strategic tip 3 (e.g., budget optimization or cultural etiquette)"
  ],
  "bestFlightBookingWindow": "e.g., 6 to 8 weeks in advance (Best booking window for holiday season)",
  "localHolidayHighlights": [
    "Highlight 1 regarding ${holidayName || 'local celebrations'} or festive events",
    "Highlight 2 on seasonal dishes or holiday markets"
  ],
  "packingTips": [
    "Essential item 1 for this climate/holiday",
    "Essential item 2"
  ],
  "suggestedItineraryDays": [
    {
      "dayNumber": 1,
      "title": "Arrival & City Orientation",
      "activities": [
        "Morning: Check-in & traditional breakfast",
        "Afternoon: Landmark walking tour",
        "Evening: Welcome holiday dinner"
      ]
    },
    {
      "dayNumber": 2,
      "title": "Cultural Immersion & Festive Highlights",
      "activities": [
        "Morning: Historical site or holiday parade",
        "Afternoon: Local market & street food tour",
        "Evening: Sunset view & rooftop dinner"
      ]
    },
    {
      "dayNumber": 3,
      "title": "Hidden Gems & Leisure",
      "activities": [
        "Morning: Nature excursion or scenic district",
        "Afternoon: Museum or artisanal shopping",
        "Evening: Leisure stroll and dining"
      ]
    }
  ]
}`;

    const result = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = result.text;
    if (!responseText) {
      return res.status(500).json({ error: "Empty response from AI provider" });
    }

    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (err) {
    console.error("Insight API error:", err);
    return res.status(500).json({ error: "Failed to generate travel insight" });
  }
}

export default handleInsightRequest;

