import { PipelineResult } from "@/types/DataToolboxTypes";
import { supabase } from "@/integrations/supabase/client";

export interface ParseRequest {
  text?: string;
  pdfData?: {
    data: string;
    mimeType: string;
  };
}

/**
 * Morning Card Parser - Uses edge function for PDF OCR
 */
export const parseMorningCard = async (
  request: ParseRequest,
  trackName?: string
): Promise<PipelineResult> => {
  if (!request.pdfData) {
    throw new Error("PDF data is required for parsing");
  }

  console.log("Calling parse-pdf-with-gemini edge function...");
  
  const { data, error } = await supabase.functions.invoke('parse-pdf-with-gemini', {
    body: {
      pdfBase64: request.pdfData.data,
      mimeType: request.pdfData.mimeType,
      parserType: 'ord',
      trackName: trackName
    }
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to parse PDF");
  }

  console.log(`Parsed ${data.stats?.races} races with ${data.stats?.horses} horses`);
  
  return data.data as PipelineResult;
};

/**
 * Racing Digest PDF Parser - Uses edge function
 */
export const parseRacingDigest = async (
  request: ParseRequest
): Promise<PipelineResult> => {
  if (!request.pdfData) {
    throw new Error("PDF data is required for parsing");
  }

  console.log("Calling parse-pdf-with-gemini for TRD...");
  
  const { data, error } = await supabase.functions.invoke('parse-pdf-with-gemini', {
    body: {
      pdfBase64: request.pdfData.data,
      mimeType: request.pdfData.mimeType,
      parserType: 'trd'
    }
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to parse PDF");
  }

  return data.data as PipelineResult;
};

/**
 * TwinSpires PDF Parser - Full data extraction with ensemble scoring
 */
export const parseTwinSpires = async (
  request: ParseRequest,
  trackName?: string
): Promise<TwinSpiresResult> => {
  if (!request.pdfData) {
    throw new Error("PDF data is required for parsing");
  }

  console.log("Calling parse-pdf-with-gemini for TwinSpires...");
  
  const { data, error } = await supabase.functions.invoke('parse-pdf-with-gemini', {
    body: {
      pdfBase64: request.pdfData.data,
      mimeType: request.pdfData.mimeType,
      parserType: 'twinspires',
      trackName: trackName
    }
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to parse PDF");
  }

  console.log(`TwinSpires: Parsed ${data.stats?.races} races with ${data.stats?.horses} horses`);
  
  return data.data as TwinSpiresResult;
};

/**
 * Backup Entries Parser - Uses edge function
 */
export const parseBackupEntries = async (
  request: ParseRequest
): Promise<PipelineResult> => {
  if (!request.pdfData) {
    throw new Error("PDF data is required for parsing");
  }

  console.log("Calling parse-pdf-with-gemini for backup...");
  
  const { data, error } = await supabase.functions.invoke('parse-pdf-with-gemini', {
    body: {
      pdfBase64: request.pdfData.data,
      mimeType: request.pdfData.mimeType,
      parserType: 'backup'
    }
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to parse PDF");
  }

  return data.data as PipelineResult;
};

// TwinSpires specific types
export interface TwinSpiresHorse {
  programNumber: string;
  postPosition: number;
  name: string;
  morningLine: string;
  brisPickRank: number | null;
  brisPickBonus: number;
  jockey: {
    name: string;
    weight: string;
    winPct: number;
    starts: number;
    wins: number;
    places: number;
    shows: number;
    statsString: string;
    bonusPoints: number;
  };
  trainer: {
    name: string;
    winPct: number;
    starts: number;
    wins: number;
    places: number;
    shows: number;
    statsString: string;
    bonusPoints: number;
    isHot: boolean;
  };
  sire: string;
  dam: string;
  damsire: string;
  age: number;
  sex: string;
  color: string;
  medication: string;
  equipment: string;
  daysOff: number;
  recencyCategory: string;
  recencyBonus: number;
  speedFigures: {
    brisnetSpeed: number;
    primePower: number;
    classRating: number;
    last3: number[];
    avgLast3: number;
    bestRecent: number;
  };
  paceFigures: {
    earlyPace: number;
    midPace: number;
    latePace: number;
    runningStyle: string;
  };
  pastPerformances: Array<{
    date: string;
    track: string;
    distance: string;
    surface: string;
    condition: string;
    finishPosition: number;
    fieldSize: number;
    beatenLengths: number;
    firstCall: number;
    secondCall: number;
    stretchCall: number;
    finalPosition: number;
    speedFigure: number;
    finalTime: string;
    odds: string;
    comment: string;
  }>;
  workouts: Array<{
    date: string;
    track: string;
    distance: string;
    time: string;
    ranking: string;
    isBullet: boolean;
  }>;
  ensembleScore: number;
  valueRating: number;
}

export interface TwinSpiresRace {
  number: number;
  postTime: string;
  distance: string;
  surface: string;
  raceType: string;
  purse: number;
  claimingPrice: number | null;
  conditions: string;
  restrictions: string;
  horses: TwinSpiresHorse[];
}

export interface TwinSpiresResult {
  source: string;
  track: string;
  date: string;
  weather: string;
  trackCondition: string;
  raceAnalysis: string;
  trackBias: {
    railPosition: string;
    surfaceBias: string;
    postPositionBias: string;
  };
  races: TwinSpiresRace[];
  trackStats: {
    postPositionStats: Array<{
      post: number;
      starts: number;
      wins: number;
      winPct: number;
    }>;
    paceScenarioStats: {
      loneFront: number;
      pressedPace: number;
      closers: number;
    };
  };
}
