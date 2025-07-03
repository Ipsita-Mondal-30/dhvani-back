import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdf-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const extractedText = await PDFProcessor.extractTextFromBuffer(buffer);

    // Save to database
    const document = await PDFProcessor.savePDFDocument(
      file.name,
      file.name,
      file.size,
      file.type,
      extractedText
    );

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        originalName: document.originalName,
        fileSize: document.fileSize,
        extractedText: document.extractedText,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
} 