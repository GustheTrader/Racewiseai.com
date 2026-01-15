import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Confident male voice options for Google Cloud TTS
const MALE_VOICES = {
  // en-US Male voices - confident, authoritative
  "en-US-Neural2-D": { name: "en-US-Neural2-D", languageCode: "en-US", ssmlGender: "MALE" }, // Deep, confident
  "en-US-Neural2-I": { name: "en-US-Neural2-I", languageCode: "en-US", ssmlGender: "MALE" }, // Warm, authoritative
  "en-US-Neural2-J": { name: "en-US-Neural2-J", languageCode: "en-US", ssmlGender: "MALE" }, // Clear, professional
  "en-US-Polyglot-1": { name: "en-US-Polyglot-1", languageCode: "en-US", ssmlGender: "MALE" }, // Natural, assured
  "en-US-Studio-M": { name: "en-US-Studio-M", languageCode: "en-US", ssmlGender: "MALE" }, // Studio quality, confident
  "en-GB-Neural2-B": { name: "en-GB-Neural2-B", languageCode: "en-GB", ssmlGender: "MALE" }, // British, authoritative
  "en-GB-Neural2-D": { name: "en-GB-Neural2-D", languageCode: "en-GB", ssmlGender: "MALE" }, // British, professional
};

// Default to the most confident-sounding male voice
const DEFAULT_VOICE = "en-US-Neural2-D";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId = DEFAULT_VOICE, speakingRate = 0.95, pitch = -2.0 } = await req.json();

    if (!text) {
      throw new Error("Text is required");
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Select voice configuration
    const voiceConfig = MALE_VOICES[voiceId as keyof typeof MALE_VOICES] || MALE_VOICES[DEFAULT_VOICE];

    // Use Google Cloud Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voiceConfig.languageCode,
            name: voiceConfig.name,
            ssmlGender: voiceConfig.ssmlGender,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: speakingRate, // Slightly slower for confidence
            pitch: pitch, // Lower pitch for authority
            volumeGainDb: 2.0, // Slightly louder for confidence
            effectsProfileId: ["large-home-entertainment-class-device"], // Rich audio profile
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google TTS error:", response.status, errorText);
      
      // Fallback response for when API isn't available
      return new Response(
        JSON.stringify({ 
          error: "TTS service unavailable",
          fallback: true,
          availableVoices: Object.keys(MALE_VOICES)
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await response.json();
    
    return new Response(
      JSON.stringify({ 
        audioContent: result.audioContent,
        voiceUsed: voiceConfig.name,
        availableVoices: Object.keys(MALE_VOICES)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ error: error.message, fallback: true }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
