import { NextRequest, NextResponse } from 'next/server';

// For now, let's create a simple TTS endpoint using Web Speech API simulation
// In production, you would use Google Cloud TTS with proper environment variables
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

    console.log('🎤 [TTS API] Processing TTS request for text length:', text.length);

    // For demo purposes, we'll use Google Cloud TTS API directly with fetch
    // In production, you should set up proper environment variables
    const gcpApiKey = process.env.GCP_API_KEY;
    
    if (!gcpApiKey) {
      // Return a mock response for development
      console.log('⚠️ [TTS API] No GCP API key found, returning mock response');
      
      // Create a minimal MP3 header for a silent audio file
      const mockAudioData = Buffer.from([
        0xFF, 0xFB, 0x90, 0x00, // MP3 header
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ]);
      
      return new NextResponse(mockAudioData, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': mockAudioData.length.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Use Google Cloud TTS REST API
    const ttsResponse = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + gcpApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: config?.voice?.languageCode || 'en-US',
          name: config?.voice?.name || 'en-US-Standard-F',
          ssmlGender: config?.voice?.ssmlGender || 'FEMALE',
        },
        audioConfig: {
          audioEncoding: config?.audioConfig?.audioEncoding || 'MP3',
          speakingRate: config?.audioConfig?.speakingRate || 1.0,
          pitch: config?.audioConfig?.pitch || 0.0,
          volumeGainDb: config?.audioConfig?.volumeGainDb || 0.0,
        },
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('❌ [TTS API] GCP Error:', ttsResponse.status, errorText);
      throw new Error(`GCP TTS API Error: ${ttsResponse.status}`);
    }

    const ttsData = await ttsResponse.json();
    
    if (!ttsData.audioContent) {
      throw new Error('No audio content received from GCP TTS API');
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(ttsData.audioContent, 'base64');

    console.log('✅ [TTS API] Speech synthesis completed, audio size:', audioBuffer.length);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
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