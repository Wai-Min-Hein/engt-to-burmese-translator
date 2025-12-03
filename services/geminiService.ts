import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TranslationSegment, DictionaryEntry } from "../types";

// Helper to create client with user provided key
const getClient = (apiKey: string) => new GoogleGenAI({ apiKey });

export const translateText = async (text: string, apiKey: string): Promise<TranslationSegment[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getClient(apiKey);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `Break the following English text into sentences or logical phrases and translate each into Burmese.
      
      Input Text:
      "${text}"
      
      Requirements:
      1. Return a JSON array.
      2. Each item must have "english" (original sentence) and "burmese" (translation).
      3. Ensure the Burmese translation is natural and accurate.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              english: { type: Type.STRING },
              burmese: { type: Type.STRING },
            },
            required: ["english", "burmese"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as TranslationSegment[];
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

export const lookupWord = async (word: string, apiKey: string): Promise<DictionaryEntry> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getClient(apiKey);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a dictionary definition for the English word "${word}". 
      Context: General English learning.
      
      Return a JSON object with:
      - word: The word being defined (lemma form).
      - phonetic: IPA pronunciation (optional).
      - partOfSpeech: e.g., Noun, Verb.
      - definition: A clear, concise definition in English.
      - exampleSentence: An example sentence using the word.
      - burmeseDefinition: A short definition or translation in Burmese.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            definition: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
            burmeseDefinition: { type: Type.STRING },
          },
          required: ["word", "partOfSpeech", "definition", "exampleSentence"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DictionaryEntry;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Dictionary lookup error:", error);
    throw error;
  }
};

export const getWordPronunciation = async (word: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getClient(apiKey);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: word }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    throw new Error("No audio data returned from API");
  } catch (error) {
    console.error("Pronunciation generation error:", error);
    throw error;
  }
};