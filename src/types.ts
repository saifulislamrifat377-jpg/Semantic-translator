export interface WordBreakdown {
  word: string;
  meaning: string;
  pronunciation: string;
  explanation: string;
}

export interface TranslationResult {
  fullTranslation: string;
  pronunciation: string;
  detectedLanguage: string;
  breakdown: WordBreakdown[];
}

export interface IslamicPhrase {
  id: string;
  phrase: string;
  arabic: string;
  bengaliTranslation: string;
  pronunciation: string;
  explanation: string;
  breakdown: WordBreakdown[];
}

export interface SavedPhrase {
  id: string;
  originalText: string;
  result: TranslationResult;
  timestamp: number;
}
