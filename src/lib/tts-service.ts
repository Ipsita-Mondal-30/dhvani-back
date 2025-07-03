import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import path from 'path';
import fs from 'fs';

export interface TTSConfig {
  voice?: {
    languageCode?: string;
    name?: string;
    ssmlGender?: 'NEUTRAL' | 'FEMALE' | 'MALE';
  };
  audioConfig?: {
    audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    speakingRate?: number;
    pitch?: number;
    volumeGainDb?: number;
  };
}

export class TTSService {
  private static client: TextToSpeechClient | null = null;

  // Initialize the TTS client
  static async initialize(): Promise<void> {
    try {
      console.log('🎤 [TTS] Initializing Google Cloud TTS client...');
      
      // Path to service account key
      const keyFilePath = path.join(process.cwd(), 'gcp-service-key.json');
      
      // Check if service account file exists
      if (!fs.existsSync(keyFilePath)) {
        throw new Error('GCP service account key file not found at: ' + keyFilePath);
      }

      // Initialize client with service account
      this.client = new TextToSpeechClient({
        keyFilename: keyFilePath,
      });

      console.log('✅ [TTS] Google Cloud TTS client initialized successfully');
    } catch (error) {
      console.error('💥 [TTS] Failed to initialize TTS client:', error);
      throw error;
    }
  }

  // Get the TTS client (initialize if needed)
  static async getClient(): Promise<TextToSpeechClient> {
    if (!this.client) {
      await this.initialize();
    }
    return this.client!;
  }

  // Synthesize speech from text
  static async synthesizeSpeech(
    text: string,
    config: TTSConfig = {}
  ): Promise<Buffer> {
    try {
      console.log('🎤 [TTS] Starting speech synthesis...');
      console.log('📝 [TTS] Text length:', text.length);
      
      const client = await this.getClient();

      // Default configuration
      const defaultConfig = {
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Standard-F',
          ssmlGender: 'FEMALE' as const,
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0,
        },
      };

      // Merge configurations
      const finalConfig = {
        voice: { ...defaultConfig.voice, ...config.voice },
        audioConfig: { ...defaultConfig.audioConfig, ...config.audioConfig },
      };

      // Prepare the request
      const request = {
        input: { text },
        voice: finalConfig.voice,
        audioConfig: finalConfig.audioConfig,
      };

      console.log('📤 [TTS] Sending request to Google Cloud TTS...');
      console.log('🔧 [TTS] Voice config:', finalConfig.voice);
      console.log('🔧 [TTS] Audio config:', finalConfig.audioConfig);

      // Perform the text-to-speech request
      const [response] = await client.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content received from TTS API');
      }

      console.log('✅ [TTS] Speech synthesis completed successfully');
      console.log('📊 [TTS] Audio content size:', response.audioContent.length, 'bytes');

      return response.audioContent as Buffer;
    } catch (error) {
      console.error('💥 [TTS] Speech synthesis failed:', error);
      throw error;
    }
  }

  // Get available voices
  static async getAvailableVoices(languageCode?: string): Promise<any[]> {
    try {
      console.log('🎭 [TTS] Fetching available voices...');
      
      const client = await this.getClient();
      const [response] = await client.listVoices({
        languageCode,
      });

      const voices = response.voices || [];
      console.log('✅ [TTS] Found', voices.length, 'available voices');
      
      return voices;
    } catch (error) {
      console.error('💥 [TTS] Failed to fetch voices:', error);
      throw error;
    }
  }

  // Validate text for TTS (check length limits, etc.)
  static validateText(text: string): { isValid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: 'Text cannot be empty' };
    }

    // Google Cloud TTS has a limit of 5000 characters
    if (text.length > 5000) {
      return { isValid: false, error: 'Text exceeds maximum length of 5000 characters' };
    }

    return { isValid: true };
  }

  // Split long text into chunks for TTS
  static splitTextIntoChunks(text: string, maxChunkSize: number = 4000): string[] {
    if (text.length <= maxChunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      
      if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        currentChunk = trimmedSentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }
    
    return chunks;
  }
} 