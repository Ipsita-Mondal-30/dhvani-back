const { Translate } = require('@google-cloud/translate').v2;

// Initialize Google Translate client
const translate = new Translate({
  keyFilename: './gcp-service-key.json', // Path to your service account key
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id',
});

// Language code mapping for consistency
const SUPPORTED_LANGUAGES = {
  'en': 'en',
  'hi': 'hi', 
  'bn': 'bn',
  'english': 'en',
  'hindi': 'hi',
  'bengali': 'bn'
} as const;

// Type definitions
export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  error?: string;
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  error?: string;
}

/**
 * Translates text to the target language
 * @param text - Text to translate
 * @param targetLang - Target language code (en, hi, bn)
 * @param sourceLang - Source language code (optional, will auto-detect if not provided)
 * @returns Promise<TranslationResult>
 */
export async function translateText(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResult> {
  try {
    // Normalize language codes
    const normalizedTargetLang = SUPPORTED_LANGUAGES[targetLang.toLowerCase() as keyof typeof SUPPORTED_LANGUAGES] || targetLang;
    
    // If target language is English or same as source, return original text
    if (normalizedTargetLang === 'en' && !sourceLang) {
      return {
        translatedText: text,
        detectedLanguage: 'en'
      };
    }

    // Prepare translation options
    const options: any = {
      to: normalizedTargetLang,
    };

    if (sourceLang) {
      options.from = SUPPORTED_LANGUAGES[sourceLang.toLowerCase() as keyof typeof SUPPORTED_LANGUAGES] || sourceLang;
    }

    // Perform translation
    const [translation, metadata] = await translate.translate(text, options);
    
    return {
      translatedText: Array.isArray(translation) ? translation[0] : translation,
      detectedLanguage: metadata?.data?.translations?.[0]?.detectedSourceLanguage || sourceLang || 'unknown'
    };

  } catch (error) {
    console.error('Translation error:', error);
    
    // Fallback: return original text if translation fails
    return {
      translatedText: text,
      detectedLanguage: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown translation error'
    };
  }
}

/**
 * Detects the language of the given text
 * @param text - Text to detect language for
 * @returns Promise<LanguageDetectionResult>
 */
export async function detectLanguage(text: string): Promise<LanguageDetectionResult> {
  try {
    const [detection] = await translate.detect(text);
    const detections = Array.isArray(detection) ? detection : [detection];
    
    return {
      language: detections[0].language,
      confidence: detections[0].confidence
    };
  } catch (error) {
    console.error('Language detection error:', error);
    return {
      language: 'en',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown detection error'
    };
  }
}

/**
 * Batch translate multiple texts
 * @param texts - Array of texts to translate
 * @param targetLang - Target language code
 * @param sourceLang - Source language code (optional)
 * @returns Promise<Array<TranslationResult>>
 */
export async function translateBatch(texts: string[], targetLang: string, sourceLang?: string): Promise<TranslationResult[]> {
  try {
    const promises = texts.map(text => translateText(text, targetLang, sourceLang));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Batch translation error:', error);
    // Return original texts if batch translation fails
    return texts.map(text => ({
      translatedText: text,
      detectedLanguage: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown batch translation error'
    }));
  }
}

/**
 * Check if a language is supported
 * @param langCode - Language code to check
 * @returns boolean
 */
export function isLanguageSupported(langCode: string): boolean {
  return Object.values(SUPPORTED_LANGUAGES).includes(langCode.toLowerCase() as any) || 
         Object.keys(SUPPORTED_LANGUAGES).includes(langCode.toLowerCase());
}

export { SUPPORTED_LANGUAGES };