import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdf-processor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const document = await PDFProcessor.getPDFDocument(id);

    if (!document) {
      return NextResponse.json({ error: 'PDF document not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Error fetching PDF document:', error);
    return NextResponse.json({ error: 'Failed to fetch PDF document' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await PDFProcessor.deletePDFDocument(id);
    return NextResponse.json({ success: true, message: 'PDF document deleted successfully' });
  } catch (error) {
    console.error('Error deleting PDF document:', error);
    return NextResponse.json({ error: 'Failed to delete PDF document' }, { status: 500 });
  }
}