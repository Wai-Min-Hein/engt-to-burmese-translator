export interface TranslationSegment {
  english: string;
  burmese: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  burmeseDefinition?: string;
}

export interface LoadingState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}