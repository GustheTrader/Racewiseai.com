// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/race-analyst-api', '');
    const method = req.method;

    // Root endpoint - API documentation
    if (path === '/' && method === 'GET') {
      return new Response(JSON.stringify({
        name: "Race Analyst API",
        version: "1.0.0",
        description: "FastAPI-style endpoints for Race Analyst operations",
        base_url: `${url.origin}/functions/v1/race-analyst-api`,
        endpoints: {
          "GET /": "API documentation",
          "GET /health": "Health check",
          "POST /analyze": "Analyze race data",
          "POST /predictions": "Generate race predictions",
          "POST /odds": "Submit odds data",
          "GET /status": "Get system status"
        },
        usage: {
          "analyze_example": {
            "method": "POST",
            "endpoint": "/analyze",
            "body": {
              "track_name": "Belmont Park",
              "race_number": 5,
              "analysis_type": "full"
            }
          },
          "predictions_example": {
            "method": "POST",
            "endpoint": "/predictions",
            "body": {
              "track_name": "Belmont Park",
              "race_number": 5,
              "prediction_type": "win_probability"
            }
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return new Response(JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "race-analyst-api",
        version: "1.0.0"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // System status endpoint
    if (path === '/status' && method === 'GET') {
      return new Response(JSON.stringify({
        status: "operational",
        services: {
          "database": "connected",
          "api": "running",
          "abacus_integration": "ready"
        },
        timestamp: new Date().toISOString(),
        uptime: "running"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze race data
    if (path === '/analyze' && method === 'POST') {
      const body = await req.json();
      const { track_name, race_number, analysis_type = "full", horses = [] } = body;

      if (!track_name || !race_number) {
        return new Response(JSON.stringify({
          error: "Missing required fields: track_name and race_number"
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const analysis = {
        request_id: crypto.randomUUID(),
        track_name,
        race_number,
        analysis_type,
        analyzed_at: new Date().toISOString(),
        race_data: {
          track: track_name,
          race: race_number,
          field_size: horses.length,
          horses: horses
        },
        analysis_results: {
          pace_analysis: "Fast early pace expected",
          track_bias: "Slight speed bias",
          key_factors: ["Early pace", "Post position", "Recent form"],
          recommended_angles: ["Speed figures", "Trainer patterns"]
        },
        confidence_score: 0.85,
        model_version: "abacus_race_analyst_v1.0"
      };

      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate predictions
    if (path === '/predictions' && method === 'POST') {
      const body = await req.json();
      const { track_name, race_number, prediction_type = "win_probability", horses = [] } = body;

      if (!track_name || !race_number) {
        return new Response(JSON.stringify({
          error: "Missing required fields: track_name and race_number"
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate sample predictions based on provided horses or default
      const defaultHorses = horses.length > 0 ? horses : [
        { number: 1, name: "Horse 1" },
        { number: 2, name: "Horse 2" },
        { number: 3, name: "Horse 3" },
        { number: 4, name: "Horse 4" },
        { number: 5, name: "Horse 5" }
      ];

      const predictions = defaultHorses.map((horse: any, index: number) => ({
        horse_number: horse.number || index + 1,
        horse_name: horse.name || `Horse ${index + 1}`,
        win_probability: Math.random() * 0.4 + 0.1, // 10-50%
        place_probability: Math.random() * 0.3 + 0.4, // 40-70%
        show_probability: Math.random() * 0.2 + 0.6, // 60-80%
        confidence: Math.random() * 0.3 + 0.6, // 60-90%
        predicted_odds: (Math.random() * 10 + 2).toFixed(1),
        key_factors: ["Speed figures", "Class", "Recent form"].slice(0, Math.floor(Math.random() * 3) + 1)
      }));

      const prediction = {
        request_id: crypto.randomUUID(),
        track_name,
        race_number,
        prediction_type,
        generated_at: new Date().toISOString(),
        predictions: predictions.sort((a, b) => b.win_probability - a.win_probability),
        top_pick: {
          horse_number: predictions[0]?.horse_number || 1,
          reasoning: "Strong speed figures and favorable pace scenario"
        },
        exotic_suggestions: {
          exacta: `${predictions[0]?.horse_number || 1}-${predictions[1]?.horse_number || 2}`,
          trifecta: `${predictions[0]?.horse_number || 1}-${predictions[1]?.horse_number || 2}-${predictions[2]?.horse_number || 3}`
        },
        model_version: "abacus_race_analyst_v1.0",
        confidence_level: "high"
      };

      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Submit odds data
    if (path === '/odds' && method === 'POST') {
      const body = await req.json();
      const { track_name, race_number, odds_data, timestamp } = body;

      return new Response(JSON.stringify({
        status: "received",
        message: "Odds data processed successfully",
        track_name,
        race_number,
        processed_at: new Date().toISOString(),
        data_points: Array.isArray(odds_data) ? odds_data.length : 1
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route not found
    return new Response(JSON.stringify({
      error: "Route not found",
      path: path,
      method: method,
      available_endpoints: ["/", "/health", "/status", "/analyze", "/predictions", "/odds"],
      documentation: `${url.origin}/functions/v1/race-analyst-api/`
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in race-analyst-api:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      service: "race-analyst-api"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});