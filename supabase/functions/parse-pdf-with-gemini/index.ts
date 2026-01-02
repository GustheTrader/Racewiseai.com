import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://racewiseai.com',
  'https://www.racewiseai.com',
  'https://app.racewiseai.com',
  'https://bqvavkzgmznjfirgfyhd.lovableproject.com',
];

function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pdfBase64, mimeType, parserType, trackName } = await req.json();

    if (!pdfBase64) {
      return new Response(JSON.stringify({ error: 'PDF data is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Parsing PDF with Gemini (type: ${parserType}, track: ${trackName})`);

    // Build prompt based on parser type
    let prompt = '';
    switch (parserType) {
      case 'ord':
        prompt = `MISSION: ABSOLUTE FULL DAILY CARD EXTRACTION & VERIFICATION.
Target Track: ${trackName || "Current Card"}

Requirements:
1. EXTRACT THE ENTIRE CARD (R1 through FINAL RACE).
2. MANDATORY FIELDS per Horse: Name, Program Number (PP), Weight (WT), Jockey, Trainer, Morning Line (ML).
3. Link Jockeys and Trainers precisely.
4. For every horse, estimate or find 5 most recent Past Performances.

DO NOT TRUNCATE. RETURN THE COMPLETE CARD.

Return as JSON with structure:
{
  "track": "string",
  "date": "YYYY-MM-DD",
  "races": [{
    "number": integer,
    "distance": "string",
    "surface": "string",
    "horses": [{
      "name": "string",
      "programNumber": "string",
      "jockey": "string",
      "trainer": "string",
      "weight": "string",
      "morningLine": "string",
      "fire": integer (speed figure 0-100),
      "consensus": integer (1-100),
      "jockeyWinRate": number (0-1),
      "trainerWinRate": number (0-1),
      "comments": "string"
    }]
  }]
}`;
        break;
      case 'trd':
        prompt = `CRITICAL MISSION: Parse this Racing Digest PDF for Racewise AI.
1. EXTRACT EVERY SINGLE RACE (R1 through the final race of the card).
2. NO TRUNCATION. If the document has 11, 12, or 15 races, you MUST return all of them.
3. FOR EVERY HORSE: Extract the "Consensus" rating, Morning Line (ML), Weight (WT), Jockey, and Trainer.
4. Generate ensemble scores (0-100 scale) for handicapping.

Return as JSON with the same structure as above.`;
        break;
      case 'twinspires':
        prompt = `CRITICAL MISSION: Parse this TwinSpires PDF racing form for complete data extraction.

EXTRACT ALL DATA POINTS FROM THE TWINSPIRES FORMAT:

1. TRACK INFORMATION:
   - Track name, date, weather, track condition
   - Track bias data (inside/outside, speed/closer bias)
   - Rail position and variant

2. RACE CONDITIONS (for each race):
   - Race number, post time, distance, surface, race type
   - Purse, claiming price (if applicable), class level
   - Age/sex restrictions, weight allowances

3. HORSE DATA (for EVERY horse):
   - Program Number (PP), Horse Name, Post Position
   - Morning Line Odds (ML)
   - Jockey (name, weight carried, meet stats: starts, wins, places, shows, win%)
   - Trainer (name, meet stats: starts, wins, places, shows, win%)
   - Owner, Breeder, Sire, Dam, Damsire
   - Color, Sex, Age
   - Lasix/Bute/Equipment changes
   
4. SPEED FIGURES & RATINGS:
   - Brisnet Speed Rating (BSR)
   - Prime Power Rating
   - Class Rating
   - Pace figures (E1, E2, LP)
   - Last 3 race speed figures
   
5. PAST PERFORMANCES (last 5-10 races):
   - Date, Track, Distance, Surface, Condition
   - Finish position, beaten lengths
   - Running positions (1st call, 2nd call, stretch, finish)
   - Speed figure for that race
   - Final time, odds
   - Comments/trip notes

6. WORKOUT DATA:
   - Date, Track, Distance, Time, Ranking
   - Bullet workouts flagged

7. TRACK BIAS & STATS SECTION:
   - Current meet stats for track
   - Post position statistics
   - Speed/pace scenario winners
   - Jockey/Trainer standings

Return as JSON:
{
  "source": "TwinSpires",
  "track": "string",
  "date": "YYYY-MM-DD",
  "weather": "string",
  "trackCondition": "string",
  "trackBias": {
    "railPosition": "string",
    "surfaceBias": "string (speed/closer)",
    "postPositionBias": "string (inside/outside/none)"
  },
  "races": [{
    "number": integer,
    "postTime": "HH:MM",
    "distance": "string",
    "surface": "string",
    "raceType": "string",
    "purse": number,
    "claimingPrice": number or null,
    "conditions": "string",
    "restrictions": "string",
    "horses": [{
      "programNumber": "string",
      "postPosition": integer,
      "name": "string",
      "morningLine": "string",
      "jockey": {
        "name": "string",
        "weight": "string",
        "meetStarts": integer,
        "meetWins": integer,
        "meetWinPct": number
      },
      "trainer": {
        "name": "string",
        "meetStarts": integer,
        "meetWins": integer,
        "meetWinPct": number
      },
      "owner": "string",
      "sire": "string",
      "dam": "string",
      "damsire": "string",
      "age": integer,
      "sex": "string",
      "color": "string",
      "medication": "string",
      "equipment": "string",
      "speedFigures": {
        "brisnetSpeed": integer,
        "primePower": number,
        "classRating": integer,
        "last3": [integer, integer, integer],
        "avgLast3": number,
        "bestRecent": integer
      },
      "paceFigures": {
        "earlyPace": number,
        "midPace": number,
        "latePace": number,
        "runningStyle": "string (E/EP/P/PS/S)"
      },
      "pastPerformances": [{
        "date": "string",
        "track": "string",
        "distance": "string",
        "surface": "string",
        "condition": "string",
        "finishPosition": integer,
        "fieldSize": integer,
        "beatenLengths": number,
        "firstCall": integer,
        "secondCall": integer,
        "stretchCall": integer,
        "finalPosition": integer,
        "speedFigure": integer,
        "finalTime": "string",
        "odds": "string",
        "comment": "string"
      }],
      "workouts": [{
        "date": "string",
        "track": "string",
        "distance": "string",
        "time": "string",
        "ranking": "string",
        "isBullet": boolean
      }],
      "ensembleScore": number (0-100, calculated from all factors),
      "valueRating": number (1-5 stars based on ML vs true odds)
    }]
  }],
  "trackStats": {
    "postPositionStats": [{
      "post": integer,
      "starts": integer,
      "wins": integer,
      "winPct": number
    }],
    "paceScenarioStats": {
      "loneFront": number,
      "pressedPace": number,
      "closers": number
    }
  }
}

IMPORTANT: Extract ALL races on the card. DO NOT TRUNCATE. Calculate ensembleScore as weighted average:
- Speed Figures (30%): Normalize best recent figure to 0-100
- Class Rating (20%): Normalize to 0-100  
- Pace Fit (15%): Based on running style vs today's pace scenario
- Connections (15%): Jockey/Trainer win rates
- Form (10%): Recent finish positions trend
- Post Position (10%): Track bias adjustment`;
        break;
      default:
        prompt = `FULL CARD BACKUP PARSER: Parse all races on this card (R1 to the end).
Map every entry to our ensemble pipeline. DO NOT STOP until the entire card is processed.
NO TRUNCATION. Ensure ML Odds, Weights, Jockeys, and Trainers are captured.

Return as JSON with structure:
{
  "track": "string",
  "date": "YYYY-MM-DD",
  "races": [{
    "number": integer,
    "distance": "string",
    "surface": "string",
    "horses": [{
      "name": "string",
      "programNumber": "string",
      "jockey": "string",
      "trainer": "string",
      "weight": "string",
      "morningLine": "string"
    }]
  }]
}`;
    }

    // Call Gemini API with PDF
    const response = await fetch(GEMINI_API_KEY ? GEMINI_API_URL + `?key=${GEMINI_API_KEY}` : GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || 'application/pdf',
                data: pdfBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini response received');

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!content) {
      console.error('Empty Gemini response');
      return new Response(
        JSON.stringify({ error: 'Empty response from Gemini' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let parsedData;
    try {
      // Handle markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      parsedData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Failed to parse Gemini response as JSON' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const racesCount = parsedData.races?.length || 0;
    const horsesCount = parsedData.races?.reduce((sum: number, r: any) => sum + (r.horses?.length || 0), 0) || 0;
    
    console.log(`Parsed ${racesCount} races with ${horsesCount} horses`);

    return new Response(JSON.stringify({
      success: true,
      data: parsedData,
      stats: {
        races: racesCount,
        horses: horsesCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('PDF parsing error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to parse PDF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
