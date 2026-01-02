import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { PipelineResult } from "@/types/DataToolboxTypes";

export interface ParseRequest {
  text?: string;
  pdfData?: {
    data: string;
    mimeType: string;
  };
}

const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    track: { type: SchemaType.STRING },
    date: { type: SchemaType.STRING },
    races: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          number: { type: SchemaType.INTEGER },
          distance: { type: SchemaType.STRING },
          surface: { type: SchemaType.STRING },
          horses: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                programNumber: { type: SchemaType.STRING },
                fire: { type: SchemaType.INTEGER },
                cpr: { type: SchemaType.INTEGER },
                fastFig: { type: SchemaType.INTEGER },
                consensus: { type: SchemaType.INTEGER },
                catboostScore: { type: SchemaType.NUMBER },
                lightgbmScore: { type: SchemaType.NUMBER },
                rnnScore: { type: SchemaType.NUMBER },
                xgboostScore: { type: SchemaType.NUMBER },
                classToday: { type: SchemaType.INTEGER },
                classRecentBest: { type: SchemaType.INTEGER },
                jockey: { type: SchemaType.STRING },
                trainer: { type: SchemaType.STRING },
                jockeyWinRate: { type: SchemaType.NUMBER },
                trainerWinRate: { type: SchemaType.NUMBER },
                weight: { type: SchemaType.STRING },
                hf: { type: SchemaType.STRING },
                comments: { type: SchemaType.STRING },
                morningLine: { type: SchemaType.STRING },
                liveOdds: { type: SchemaType.STRING },
                pastPerformances: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      date: { type: SchemaType.STRING },
                      finish: { type: SchemaType.STRING },
                      dist: { type: SchemaType.STRING }
                    }
                  }
                }
              },
              required: [
                "name",
                "programNumber",
                "jockey",
                "trainer",
                "weight",
                "morningLine"
              ]
            }
          }
        },
        required: ["number", "horses"]
      }
    }
  },
  required: ["track", "date", "races"]
};

/**
 * Morning Card Parser & Web Scraper Hybrid
 */
export const parseMorningCard = async (
  request: ParseRequest,
  trackName?: string,
  apiKey?: string
): Promise<PipelineResult> => {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("Gemini API key not configured. Please set VITE_GEMINI_API_KEY");
  }

  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `MISSION: ABSOLUTE FULL DAILY CARD EXTRACTION & VERIFICATION.
    Primary Source: ${request.pdfData ? "Uploaded PDF" : "Web Scrape of offtrackbetting.com"}
    Target Track: ${trackName || "Current Card"}

    Requirements:
    1. EXTRACT THE ENTIRE CARD (R1 through FINAL RACE).
    2. MANDATORY FIELDS per Horse: Name, Program Number (PP), Weight (WT), Jockey, Trainer, Morning Line (ML).
    3. If parsing a PDF, match entries against live entries if trackName is provided.
    4. Link Jockeys and Trainers precisely.
    5. For every horse, estimate or find 5 most recent Past Performances.

    DO NOT TRUNCATE. RETURN THE COMPLETE CARD.`;

  const parts: any[] = [{ text: prompt }];

  if (request.pdfData) {
    parts.push({
      inlineData: {
        mimeType: request.pdfData.mimeType,
        data: request.pdfData.data
      }
    });
  } else if (request.text) {
    parts.push({ text: request.text });
  }

  const response = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      maxOutputTokens: 4096
    }
  });

  const text = response.response.text();
  const data = JSON.parse(text);

  return data as PipelineResult;
};

/**
 * Racing Digest PDF Parser
 */
export const parseRacingDigest = async (
  request: ParseRequest,
  apiKey?: string
): Promise<PipelineResult> => {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("Gemini API key not configured");
  }

  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `CRITICAL MISSION: Parse this Racing Digest PDF for Racewise AI.
    1. EXTRACT EVERY SINGLE RACE (R1 through the final race of the card).
    2. NO TRUNCATION. If the document has 11, 12, or 15 races, you MUST return all of them.
    3. FOR EVERY HORSE: Extract the "Consensus" rating, Morning Line (ML), Weight (WT), Jockey, and Trainer.
    4. Generate ensemble scores (0-100 scale) for handicapping.`;

  const parts: any[] = [{ text: prompt }];
  if (request.pdfData) {
    parts.push({
      inlineData: {
        mimeType: request.pdfData.mimeType,
        data: request.pdfData.data
      }
    });
  } else if (request.text) {
    parts.push({ text: request.text });
  }

  const response = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      maxOutputTokens: 4096
    }
  });

  const text = response.response.text();
  return JSON.parse(text) as PipelineResult;
};

/**
 * Backup Entries Parser - Fallback for complete card coverage
 */
export const parseBackupEntries = async (
  request: ParseRequest,
  apiKey?: string
): Promise<PipelineResult> => {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("Gemini API key not configured");
  }

  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `FULL CARD BACKUP PARSER: Parse all races on this card (R1 to the end).
    Map every entry to our ensemble pipeline. DO NOT STOP until the entire card is processed.
    NO TRUNCATION. Ensure ML Odds, Weights, Jockeys, and Trainers are captured.`;

  const parts: any[] = [{ text: prompt }];
  if (request.pdfData) {
    parts.push({
      inlineData: {
        mimeType: request.pdfData.mimeType,
        data: request.pdfData.data
      }
    });
  } else if (request.text) {
    parts.push({ text: request.text });
  }

  const response = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      maxOutputTokens: 4096
    }
  });

  const text = response.response.text();
  return JSON.parse(text) as PipelineResult;
};
