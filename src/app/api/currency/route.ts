// app/api/currency-detection/process/route.ts - Backend image processing
import { NextRequest, NextResponse } from 'next/server';

interface CurrencyDetectionResult {
  denomination: number;
  confidence?: number;
  detectedText?: string;
  isIndianCurrency: boolean;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS method for CORS preflight
const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
};

export { OPTIONS };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Base64 image is required' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Process image with Google Vision API
    const result = await processImageWithVisionAPI(image);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Currency processed successfully'
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Currency processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process currency image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

async function processImageWithVisionAPI(base64Image: string): Promise<CurrencyDetectionResult> {
  const apiKey = process.env.GCP_API_KEY;
  
  if (!apiKey) {
    console.error('GCP_API_KEY is not set in environment variables');
    throw new Error('Google Cloud Vision API key not found. Please check your environment configuration.');
  }

  const requestBody = {
    requests: [
      {
        image: { content: base64Image },
        features: [
          { type: 'TEXT_DETECTION', maxResults: 20 },
          { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 10 }
        ],
      },
    ],
  };

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Vision API Error Response:', errorText);
      throw new Error(`Vision API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.error) {
      console.error('Vision API error:', result.error);
      throw new Error(result.error.message || 'Vision API error');
    }

    const responses = result.responses;
    if (!responses || responses.length === 0) {
      throw new Error('No responses from Vision API');
    }

    return parseVisionResponse(responses[0]);
    
  } catch (error) {
    console.error('Error calling Google Vision API:', error);
    throw new Error(`Failed to process image with Vision API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseVisionResponse(response: any): CurrencyDetectionResult {
  const textAnnotations = response?.textAnnotations;
  const fullTextAnnotation = response?.fullTextAnnotation;
  
  if (!textAnnotations?.length && !fullTextAnnotation?.text) {
    throw new Error('No text detected in the image');
  }

  // Collect all text
  let allText = '';
  
  if (textAnnotations && textAnnotations.length > 0) {
    allText += textAnnotations[0].description || '';
  }
  
  if (fullTextAnnotation?.text) {
    allText += ' ' + fullTextAnnotation.text;
  }

  // Additional text from all annotations
  if (textAnnotations) {
    textAnnotations.forEach((annotation: { description?: string }, index: number) => {
      if (index > 0) { // Skip first one as it's already included
        allText += ' ' + (annotation.description || '');
      }
    });
  }

  const fullText = allText.toLowerCase();
  
  // Check if it's Indian currency
  const indianCurrencyIndicators = [
    'rupee', 'india', 'reserve bank', 'rbi', 'inr', 'भारत', 'गवर्नर', 'गारंटी'
  ];
  
  const isIndianCurrency = indianCurrencyIndicators.some(indicator => 
    fullText.includes(indicator.toLowerCase())
  );

  // Detect denomination
  const denomination = extractDenomination(fullText);

  if (!denomination) {
    throw new Error('Could not determine denomination from detected text');
  }

  return {
    denomination,
    detectedText: allText.substring(0, 500), // Limit text length
    isIndianCurrency,
    confidence: calculateConfidence(fullText, denomination)
  };
}

function extractDenomination(text: string): number | null {
  const denominations = [2000, 500, 200, 100, 50, 20, 10]; // Check larger denominations first
  
  // Method 1: Direct number matching with context
  for (const denom of denominations) {
    const patterns = [
      new RegExp(`\\b${denom}\\b`, 'i'),
      new RegExp(`${denom}\\s*rupee`, 'i'),
      new RegExp(`rs\\s*${denom}`, 'i'),
      new RegExp(`₹\\s*${denom}`, 'i'),
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return denom;
      }
    }
  }

  // Method 2: Written number matching
  const writtenNumbers: Record<string, number> = {
    'ten': 10,
    'twenty': 20,
    'fifty': 50,
    'one hundred': 100,
    'hundred': 100,
    'two hundred': 200,
    'five hundred': 500,
    'two thousand': 2000,
    'thousand': 2000 // Sometimes "two" might be missed
  };

  for (const [written, value] of Object.entries(writtenNumbers)) {
    if (text.includes(written)) {
      return value;
    }
  }

  // Method 3: Any number that matches valid denominations
  const numberMatches = text.match(/\b(\d+)\b/g);
  if (numberMatches) {
    for (const numberStr of numberMatches) {
      const number = parseInt(numberStr, 10);
      if (denominations.includes(number)) {
        return number;
      }
    }
  }

  return null;
}

function calculateConfidence(text: string, denomination: number): number {
  let confidence = 0.5; // Base confidence

  // Higher confidence if multiple indicators are present
  const denominationStr = denomination.toString();
  if (text.includes(denominationStr)) confidence += 0.2;
  if (text.includes('rupee')) confidence += 0.1;
  if (text.includes('reserve bank')) confidence += 0.1;
  if (text.includes('india')) confidence += 0.1;

  return Math.min(confidence, 1.0);
}