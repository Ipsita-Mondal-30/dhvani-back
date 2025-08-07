import { NextRequest, NextResponse } from 'next/server';

// Google Cloud Text-to-Speech API implementation
export async function POST(request: NextRequest) {
  try {
    const { text, config } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Validate text length
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 5000 characters' },
        { status: 400 }
      );
    }

    console.log('🎤 [TTS API] Processing Google Cloud TTS request for text length:', text.length);

    // Get Google Cloud API key from environment variables
    const gcpApiKey = process.env.GCP_API_KEY;
    
    if (!gcpApiKey) {
      console.log('⚠️ [TTS API] No GCP API key found');
      return NextResponse.json(
        { error: 'TTS service not configured. Please set up GCP_API_KEY environment variable.' },
        { status: 503 }
      );
    }

    console.log('🔊 [TTS API] Using Google Cloud TTS API');

    // Google Cloud TTS configuration
    const voice = {
      languageCode: config?.voice?.languageCode || 'en-US',
      name: config?.voice?.name || 'en-US-Standard-F',
      ssmlGender: config?.voice?.ssmlGender || 'FEMALE',
    };
    
    const audioConfig = {
      audioEncoding: config?.audioConfig?.audioEncoding || 'MP3',
      speakingRate: config?.audioConfig?.speakingRate || 1.0,
      pitch: config?.audioConfig?.pitch || 0.0,
      volumeGainDb: config?.audioConfig?.volumeGainDb || 0.0,
    };

    // Call Google Cloud TTS API
    const ttsResponse = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + gcpApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice,
        audioConfig,
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('❌ [TTS API] Google Cloud Error:', ttsResponse.status, errorText);
      throw new Error(`Google Cloud TTS API Error: ${ttsResponse.status}`);
    }

    const ttsData = await ttsResponse.json();
    
    if (!ttsData.audioContent) {
      throw new Error('No audio content received from Google Cloud TTS API');
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(ttsData.audioContent, 'base64');

    console.log('✅ [TTS API] Google Cloud speech synthesis completed, audio size:', audioBuffer.length);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('💥 [TTS API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 