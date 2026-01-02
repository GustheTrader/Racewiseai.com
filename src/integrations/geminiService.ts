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
