import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GCP_API_KEY;
  const apiKeyExists = !!apiKey;
  const keyLength = apiKey?.length || 0;
  const keyPreview = apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(keyLength - 5)}` : 'N/A';
  
  return NextResponse.json({
    status: 'success',
    apiKey: {
      exists: apiKeyExists,
      length: keyLength,
      preview: keyPreview,
      isSet: apiKeyExists ? 'Yes' : 'No',
      isLikelyValid: apiKeyExists && keyLength > 30 ? 'Likely Valid' : 'Likely Invalid'
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
}
