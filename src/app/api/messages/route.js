import { NextResponse } from 'next/server';
import { translateText } from '../../../utils/translate';
import { getLanguageFromRequest } from '../../../middleware/setLanguage';

// Sample messages in English (these would typically come from a database)
const MESSAGES = {
  welcome: "Welcome to Dhvani! Your voice-first accessibility application.",
  instructions: "Upload a PDF file or enter text to convert it to speech. Use the controls to adjust playback speed and voice settings.",
  features: [
    "Convert PDF documents to speech",
    "Adjust voice speed and pitch",
    "Save and manage your audio files",
    "Accessible interface for all users",
    "Multi-language support"
  ],
  errors: {
    fileNotFound: "The requested file could not be found.",
    processingError: "An error occurred while processing your request.",
    invalidFormat: "The file format is not supported."
  },
  success: {
    fileUploaded: "File uploaded successfully!",
    textConverted: "Text has been converted to speech.",
    settingsSaved: "Your settings have been saved."
  }
};

export async function GET(request) {
  try {
    // Get the preferred language from request
    const language = getLanguageFromRequest(request);
    const { searchParams } = new URL(request.url);
    const messageType = searchParams.get('type') || 'welcome';
    
    // Get the requested message
    let message;
    const messageParts = messageType.split('.');
    
    if (messageParts.length === 1) {
      message = MESSAGES[messageType];
    } else if (messageParts.length === 2) {
      message = MESSAGES[messageParts[0]]?.[messageParts[1]];
    }
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message type not found' },
        { status: 404 }
      );
    }
    
    // Handle array messages (like features)
    if (Array.isArray(message)) {
      if (language === 'en') {
        return NextResponse.json({
          language,
          messageType,
          messages: message,
          translated: false
        });
      }
      
      // Translate each message in the array
      const translatedMessages = [];
      for (const msg of message) {
        const result = await translateText(msg, language);
        translatedMessages.push(result.translatedText);
      }
      
      return NextResponse.json({
        language,
        messageType,
        messages: translatedMessages,
        translated: true
      });
    }
    
    // Handle single message
    if (language === 'en') {
      return NextResponse.json({
        language,
        messageType,
        message,
        translated: false
      });
    }
    
    // Translate the message
    const result = await translateText(message, language);
    
    return NextResponse.json({
      language,
      messageType,
      message: result.translatedText,
      originalMessage: message,
      detectedLanguage: result.detectedLanguage,
      translated: true,
      translationError: result.error || null
    });
    
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const language = getLanguageFromRequest(request);
    const body = await request.json();
    const { text, targetLanguage } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    const targetLang = targetLanguage || language;
    
    if (targetLang === 'en') {
      return NextResponse.json({
        originalText: text,
        translatedText: text,
        language: 'en',
        translated: false
      });
    }
    
    const result = await translateText(text, targetLang);
    
    return NextResponse.json({
      originalText: text,
      translatedText: result.translatedText,
      language: targetLang,
      detectedLanguage: result.detectedLanguage,
      translated: true,
      translationError: result.error || null
    });
    
  } catch (error) {
    console.error('Messages POST API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}