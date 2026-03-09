import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TranslationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function translateText(text: string): Promise<TranslationResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following text to Bengali. The input text could be English, Arabic, or Urdu. 
    Provide:
    1. A full translation in Bengali.
    2. The pronunciation of the ORIGINAL input text written in Bengali script.
    3. A word-by-word breakdown. 
    For each word, include the original word, Bengali meaning, pronunciation (in Bengali script), and a short explanation in Bengali.
    Ensure all output text (except the original word) is in Bengali.
    
    Input Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullTranslation: { type: Type.STRING },
          pronunciation: { type: Type.STRING, description: "Pronunciation of the original input text in Bengali script" },
          detectedLanguage: { type: Type.STRING },
          breakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                meaning: { type: Type.STRING },
                pronunciation: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["word", "meaning", "pronunciation", "explanation"],
            },
          },
        },
        required: ["fullTranslation", "pronunciation", "detectedLanguage", "breakdown"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function generateSpeech(text: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Pronounce clearly: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/mp3;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
