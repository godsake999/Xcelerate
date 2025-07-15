
export type LanguageData = {
  en: string;
  my: string;
}

export type LanguageDataArray = {
  en: string[];
  my: string[];
}

export type VisualExplanation = {
  imageUrl: string;
};

export type Formula = {
  id: number;
  created_at?: string;
  title: LanguageData;
  category: LanguageData;
  shortDescription: LanguageData;
  longDescription: LanguageDataArray;
  syntax: string;
  example: string;
  exampleExplanation: LanguageData;
  visualExplanation?: VisualExplanation;
};

// This mock data is now deprecated and will not be used.
// The application fetches data directly from Supabase.
export const formulas: Formula[] = [];
