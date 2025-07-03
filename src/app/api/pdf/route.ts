import { NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdf-processor';

export async function GET() {
  try {
    const documents = await PDFProcessor.getPDFDocuments();
    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Error fetching PDF documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PDF documents' },
      { status: 500 }
    );
  }
} 