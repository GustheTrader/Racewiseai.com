import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

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

/**
 * Verify JWT token using Supabase auth
 */
async function verifyAuth(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }

  return { userId: data.user.id };
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY FIX: Verify authentication
    const auth = await verifyAuth(req);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    console.log(`Parsing PDF with Gemini (type: ${parserType}, track: ${trackName}) for user ${auth.userId}`);

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
        prompt = `CRITICAL MISSION: Parse this TwinSpires/BrisPicks PDF racing form for complete data extraction.

EXTRACT ALL DATA POINTS FROM THE FORMAT:

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
   
4. JOCKEY DATA (CRITICAL - extract full stats):
   - Jockey name
   - Weight carried
   - Win percentage (the XX% shown)
   - Career/Meet stats: starts-wins-places-shows (format: XXX-XX-XX-XX)
   - Calculate bonus: +5 points if win% >= 20%, +3 if >= 15%, +2 if >= 10%
   
5. TRAINER DATA (CRITICAL - extract full stats):
   - Trainer name  
   - Win percentage (the XX% shown)
   - Career/Meet stats: starts-wins-places-shows (format: XXX-XX-XX-XX)
   - Calculate bonus: +5 points if win% >= 20%, +3 if >= 15%, +2 if >= 10%
   - Hot trainer indicator: flag if win rate is above 14% with 3+ recent wins

6. BRIS PICKS / EXPERT PICKS (CRITICAL - consensus data):
   - Look for "EXPERT 1ST PICK", "EXPERT 2ND PICK", "EXPERT 3RD PICK" labels
   - Extract Nick's Picks or expert selection order
   - Assign brisPickRank: 1 for 1st pick (+10 bonus), 2 for 2nd pick (+7 bonus), 3 for 3rd pick (+5 bonus)
   - Parse the race analysis text for key insights

7. DAYS OFF / RACE RECENCY (CRITICAL):
   - Calculate days since last race from past performances
   - Fresh (15-45 days): +3 bonus
   - Rested (46-90 days): +1 bonus  
   - Layoff (>90 days): -5 penalty
   - Quick turnaround (<14 days): -2 penalty
   - Flag "has not raced for more than 2 months" horses

8. SPEED FIGURES & RATINGS:
   - Brisnet Speed Rating (BSR)
   - Prime Power Rating
   - Class Rating
   - Pace figures (E1, E2, LP)
   - Last 3 race speed figures
   
9. PAST PERFORMANCES (last 5-10 races):
   - Date, Track, Distance, Surface, Condition
   - Finish position, beaten lengths
   - Running positions (1st call, 2nd call, stretch, finish)
   - Speed figure for that race
   - Final time, odds
   - Comments/trip notes

10. WORKOUT DATA:
    - Date, Track, Distance, Time, Ranking
    - Bullet workouts flagged

11. SIRE/DAM INFORMATION:
    - Sire name
    - Dam name and Damsire

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
  "raceAnalysis": "string (the BRIS analysis text for the race)",
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
      "brisPickRank": integer or null (1=1st pick, 2=2nd, 3=3rd, null=not picked),
      "brisPickBonus": number (10 for 1st, 7 for 2nd, 5 for 3rd, 0 otherwise),
      "jockey": {
        "name": "string",
        "weight": "string",
        "winPct": number (the percentage shown like 13, 20, etc),
        "starts": integer,
        "wins": integer,
        "places": integer,
        "shows": integer,
        "statsString": "string (raw stats like 712-89-84-94)",
        "bonusPoints": number (5 if >=20%, 3 if >=15%, 2 if >=10%, 0 otherwise)
      },
      "trainer": {
        "name": "string",
        "winPct": number,
        "starts": integer,
        "wins": integer,
        "places": integer,
        "shows": integer,
        "statsString": "string (raw stats)",
        "bonusPoints": number (5 if >=20%, 3 if >=15%, 2 if >=10%, 0 otherwise),
        "isHot": boolean (true if win% > 14% with recent wins)
      },
      "sire": "string",
      "dam": "string", 
      "damsire": "string",
      "age": integer,
      "sex": "string",
      "color": "string",
      "medication": "string",
      "equipment": "string",
      "daysOff": integer (days since last race),
      "recencyCategory": "string (fresh/rested/layoff/quick)",
      "recencyBonus": number (+3 fresh, +1 rested, -5 layoff, -2 quick),
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
      "ensembleScore": number (0-100, calculated with bonuses),
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

IMPORTANT: Extract ALL races on the card. DO NOT TRUNCATE. 

Calculate ensembleScore as weighted average WITH BONUSES:
- Speed Figures (25%): Normalize best recent figure to 0-100
- Class Rating (15%): Normalize to 0-100  
- Pace Fit (10%): Based on running style vs today's pace scenario
- Jockey Stats (15%): Base on win% + jockey bonus points
- Trainer Stats (15%): Base on win% + trainer bonus points + hot trainer flag
- Form/Recency (10%): Recent finish positions + recency bonus
- Post Position (5%): Track bias adjustment
- BRIS Pick Bonus (5%): Add brisPickBonus to final score`;
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

    interface Race {
      horses?: unknown[];
    }

    const racesCount = parsedData.races?.length || 0;
    const horsesCount = parsedData.races?.reduce((sum: number, r: Race) => sum + (r.horses?.length || 0), 0) || 0;
    
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

  } catch (error: unknown) {
    console.error('PDF parsing error:', error);
    const message = error instanceof Error ? error.message : 'Failed to parse PDF';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
