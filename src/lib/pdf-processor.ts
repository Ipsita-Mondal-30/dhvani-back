import { prisma } from './prisma';

export class PDFProcessor {
  static async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      // Dynamic import to avoid test file loading issues
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  static async savePDFDocument(
    filename: string,
    originalName: string,
    fileSize: number,
    mimeType: string,
    extractedText: string,
    filePath?: string
  ) {
    try {
      const document = await prisma.pDFDocument.create({
        data: {
          filename,
          originalName,
          fileSize,
          mimeType,
          extractedText,
          filePath,
        },
      });
      return document;
    } catch (error) {
      console.error('Error saving PDF document:', error);
      throw new Error('Failed to save PDF document');
    }
  }

  static async getPDFDocuments() {
    try {
      return await prisma.pDFDocument.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error fetching PDF documents:', error);
      throw new Error('Failed to fetch PDF documents');
    }
  }

  static async getPDFDocument(id: string) {
    try {
      return await prisma.pDFDocument.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error fetching PDF document:', error);
      throw new Error('Failed to fetch PDF document');
    }
  }

  static async deletePDFDocument(id: string) {
    try {
      return await prisma.pDFDocument.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting PDF document:', error);
      throw new Error('Failed to delete PDF document');
    }
  }
} 