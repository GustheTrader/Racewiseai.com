import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://racewiseai.com',
  'https://www.racewiseai.com',
  'https://app.racewiseai.com',
  'https://bqvavkzgmznjfirgfyhd.lovableproject.com',
  'https://id-preview--a07bce7a-713d-446c-8c0f-8ea801d1fd15.lovable.app',
  'https://racewiseai.lovable.app',
];

function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

type Sample = {
  raceKey: string;
  won: boolean;
  features: Record<string, number>;
};

const FEATURE_IDS = [
  'speed_figure',
  'pace_rating',
  'class_rating',
  'jockey_stats',
  'trainer_stats',
  'jockey_trainer_combo',
  'track_bias',
  'surface_preference',
  'distance_preference',
  'days_since_race',
  'weight_carried',
  'post_position',
  'field_size',
  'morning_line_odds',
  'odds_movement',
];

function num(v: unknown): number | null {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

/** z-score features within each race so weights are comparable */
function normalizeWithinRace(samples: Sample[], features: string[]) {
  const byRace = new Map<string, Sample[]>();
  for (const s of samples) {
    if (!byRace.has(s.raceKey)) byRace.set(s.raceKey, []);
    byRace.get(s.raceKey)!.push(s);
  }
  for (const group of byRace.values()) {
    for (const f of features) {
      const vals = group.map((s) => s.features[f] ?? 0);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length) || 1;
      group.forEach((s, i) => {
        s.features[f] = (vals[i] - mean) / sd;
      });
    }
  }
  return byRace;
}

function evaluate(byRace: Map<string, Sample[]>, weights: Record<string, number>, features: string[]) {
  let correct = 0;
  let races = 0;
  let logLoss = 0;
  let labeled = 0;

  for (const group of byRace.values()) {
    if (group.length < 2) continue;
    const scores = group.map((s) =>
      features.reduce((acc, f) => acc + (weights[f] ?? 0) * (s.features[f] ?? 0), 0),
    );
    const max = Math.max(...scores);
    const exps = scores.map((s) => Math.exp(s - max));
    const sum = exps.reduce((a, b) => a + b, 0) || 1;
    const probs = exps.map((e) => e / sum);

    const winnerIdx = group.findIndex((s) => s.won);
    if (winnerIdx < 0) continue;
    races++;
    labeled++;
    const predIdx = probs.indexOf(Math.max(...probs));
    if (predIdx === winnerIdx) correct++;
    logLoss += -Math.log(Math.max(probs[winnerIdx], 1e-9));
  }

  return {
    accuracy: races ? (correct / races) * 100 : null,
    logLoss: labeled ? logLoss / labeled : null,
    racesEvaluated: races,
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  let modelId: string | null = null;
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401, corsHeaders);

    const { data: isAdmin } = await userClient.rpc('has_role', {
      _user_id: userData.user.id,
      _role: 'admin',
    });
    if (!isAdmin) return json({ error: 'Admin access required' }, 403, corsHeaders);

    const body = await req.json().catch(() => ({}));
    modelId = typeof body.modelId === 'string' ? body.modelId : null;
    if (!modelId) return json({ error: 'modelId is required' }, 400, corsHeaders);

    const { data: model, error: modelErr } = await admin
      .from('trained_models')
      .select('*')
      .eq('id', modelId)
      .maybeSingle();
    if (modelErr || !model) return json({ error: 'Model not found' }, 404, corsHeaders);

    const features: string[] = (Array.isArray(model.features) ? model.features : []).filter(
      (f: unknown): f is string => typeof f === 'string' && FEATURE_IDS.includes(f),
    );
    if (features.length < 3) {
      return json({ error: 'Model needs at least 3 valid features' }, 400, corsHeaders);
    }

    await admin
      .from('trained_models')
      .update({ status: 'training', error: null })
      .eq('id', modelId);

    // ---- Build dataset from historical results -------------------------------
    const samples: Sample[] = [];

    const { data: pps } = await admin
      .from('past_performances')
      .select(
        'horse_id, race_id, race_date, track_id, race_number, distance, surface, finish_position, speed_figure, first_call_position, stretch_position, weight_carried, odds, jockey, trainer',
      )
      .not('finish_position', 'is', null)
      .order('race_date', { ascending: false })
      .limit(5000);

    for (const pp of pps ?? []) {
      const raceKey = pp.race_id ?? `${pp.track_id}-${pp.race_date}-${pp.race_number}`;
      if (!raceKey) continue;
      samples.push({
        raceKey,
        won: pp.finish_position === 1,
        features: {
          speed_figure: num(pp.speed_figure) ?? 0,
          pace_rating: -(num(pp.first_call_position) ?? 0) - (num(pp.stretch_position) ?? 0),
          class_rating: num(pp.speed_figure) ?? 0,
          jockey_stats: 0,
          trainer_stats: 0,
          jockey_trainer_combo: 0,
          track_bias: 0,
          surface_preference: pp.surface ? 1 : 0,
          distance_preference: num(pp.distance) ?? 0,
          days_since_race: 0,
          weight_carried: num(pp.weight_carried) ?? 0,
          post_position: 0,
          field_size: 0,
          morning_line_odds: -(num(pp.odds) ?? 0),
          odds_movement: 0,
        },
      });
    }

    const { data: entries } = await admin
      .from('race_entries')
      .select(
        'race_id, post_position, weight_carried, morning_line_odds, current_odds, final_odds, speed_figure, finish_position, jockey_id, trainer_id',
      )
      .not('finish_position', 'is', null)
      .limit(5000);

    for (const e of entries ?? []) {
      if (!e.race_id) continue;
      samples.push({
        raceKey: `entry-${e.race_id}`,
        won: e.finish_position === 1,
        features: {
          speed_figure: num(e.speed_figure) ?? 0,
          pace_rating: 0,
          class_rating: num(e.speed_figure) ?? 0,
          jockey_stats: 0,
          trainer_stats: 0,
          jockey_trainer_combo: 0,
          track_bias: 0,
          surface_preference: 0,
          distance_preference: 0,
          days_since_race: 0,
          weight_carried: num(e.weight_carried) ?? 0,
          post_position: -(num(e.post_position) ?? 0),
          field_size: 0,
          morning_line_odds: -(num(e.morning_line_odds) ?? 0),
          odds_movement:
            (num(e.morning_line_odds) ?? 0) - (num(e.final_odds) ?? num(e.current_odds) ?? 0),
        },
      });
    }

    // Keep only races that actually contain a recorded winner and >1 runner
    const grouped = new Map<string, Sample[]>();
    for (const s of samples) {
      if (!grouped.has(s.raceKey)) grouped.set(s.raceKey, []);
      grouped.get(s.raceKey)!.push(s);
    }
    const usable = [...grouped.values()].filter(
      (g) => g.length > 1 && g.some((s) => s.won),
    );
    const flat = usable.flat();

    if (usable.length < 5) {
      const message = `Not enough labeled historical races to train (found ${usable.length}, need at least 5). Import race results with finishing positions first.`;
      await admin
        .from('trained_models')
        .update({ status: 'failed', error: message, training_samples: flat.length })
        .eq('id', modelId);
      return json({ error: message }, 422, corsHeaders);
    }

    normalizeWithinRace(flat, features);

    // Train/holdout split by race
    const raceKeys = [...new Set(flat.map((s) => s.raceKey))];
    const splitAt = Math.max(1, Math.floor(raceKeys.length * 0.8));
    const trainKeys = new Set(raceKeys.slice(0, splitAt));
    const trainMap = new Map<string, Sample[]>();
    const holdoutMap = new Map<string, Sample[]>();
    for (const s of flat) {
      const target = trainKeys.has(s.raceKey) ? trainMap : holdoutMap;
      if (!target.has(s.raceKey)) target.set(s.raceKey, []);
      target.get(s.raceKey)!.push(s);
    }

    // ---- Ask Lovable AI to propose feature weights ---------------------------
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) {
      await admin
        .from('trained_models')
        .update({ status: 'failed', error: 'LOVABLE_API_KEY is not configured' })
        .eq('id', modelId);
      return json({ error: 'LOVABLE_API_KEY is not configured' }, 500, corsHeaders);
    }

    // Per-feature signal: mean z-value of winners vs. all runners
    const signal: Record<string, { winnerMean: number; fieldMean: number }> = {};
    for (const f of features) {
      const winners = flat.filter((s) => s.won).map((s) => s.features[f] ?? 0);
      const all = flat.map((s) => s.features[f] ?? 0);
      signal[f] = {
        winnerMean: +(winners.reduce((a, b) => a + b, 0) / (winners.length || 1)).toFixed(4),
        fieldMean: +(all.reduce((a, b) => a + b, 0) / (all.length || 1)).toFixed(4),
      };
    }

    const prompt = `You are calibrating a ${model.model_type} horse-racing win model.
Dataset: ${trainMap.size} training races, ${flat.length} runner rows, ${model.epochs} configured epochs.
Each feature is z-scored within its race. Below is the mean z-value for winners versus the whole field:
${JSON.stringify(signal, null, 2)}

Return a weight for EVERY feature id listed here: ${features.join(', ')}.
Weights are used in a softmax over runners in a race (higher score = more likely winner).
Use the winner-vs-field separation to size and sign each weight; keep weights between -3 and 3.
Also return a short plain-English note (max 400 chars) explaining the calibration.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Lovable-API-Key': lovableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.7-flash',
        messages: [
          { role: 'system', content: 'You are a quantitative horse racing modeler. Reply with JSON only.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      const message =
        aiRes.status === 429
          ? 'AI Gateway rate limit reached. Try again in a moment.'
          : aiRes.status === 402
          ? 'AI credits exhausted. Add credits in Lovable to continue training.'
          : `AI Gateway error ${aiRes.status}: ${detail.slice(0, 300)}`;
      await admin.from('trained_models').update({ status: 'failed', error: message }).eq('id', modelId);
      return json({ error: message }, aiRes.status, corsHeaders);
    }

    const aiJson = await aiRes.json();
    let parsed: { weights?: Record<string, number>; notes?: string } = {};
    try {
      parsed = JSON.parse(aiJson.choices?.[0]?.message?.content ?? '{}');
    } catch (_) {
      parsed = {};
    }

    const rawWeights = (parsed.weights ?? (parsed as Record<string, unknown>)) as Record<string, unknown>;
    const weights: Record<string, number> = {};
    for (const f of features) {
      const w = num(rawWeights?.[f]);
      // Fall back to the empirical winner-vs-field separation when the model omits a feature
      weights[f] = Math.max(-3, Math.min(3, w ?? signal[f].winnerMean - signal[f].fieldMean));
    }

    const trainMetrics = evaluate(trainMap, weights, features);
    const holdoutMetrics = evaluate(holdoutMap.size ? holdoutMap : trainMap, weights, features);

    const { error: saveErr } = await admin
      .from('trained_models')
      .update({
        status: 'completed',
        weights,
        accuracy: holdoutMetrics.accuracy,
        log_loss: holdoutMetrics.logLoss,
        training_samples: flat.length,
        notes: typeof parsed.notes === 'string' ? parsed.notes.slice(0, 800) : null,
        error: null,
        trained_at: new Date().toISOString(),
      })
      .eq('id', modelId);

    if (saveErr) throw saveErr;

    return json(
      {
        success: true,
        weights,
        trainRaces: trainMap.size,
        holdoutRaces: holdoutMap.size,
        train: trainMetrics,
        holdout: holdoutMetrics,
      },
      200,
      corsHeaders,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected training error';
    console.error('train-model error:', message);
    if (modelId) {
      await admin.from('trained_models').update({ status: 'failed', error: message }).eq('id', modelId);
    }
    return json({ error: message }, 500, corsHeaders);
  }
});
