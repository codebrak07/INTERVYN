import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdfjs worker to use jsdelivr CDN matching version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ResumeValidationResult {
  isValid: boolean;
  error?: string;
  fileSizeKB?: number;
  fileName?: string;
  fileType?: string;
}

export class ResumeParserService {
  static validateFile(file: File): ResumeValidationResult {
    const fileSizeKB = Math.round(file.size / 1024);
    const maxSizeBytes = 1 * 1024 * 1024; // 1 MB strict limit

    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 1 MB limit.`,
        fileSizeKB,
        fileName: file.name,
        fileType: file.type
      };
    }

    const validExtensions = ['.pdf', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const isExtensionValid = validExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!isExtensionValid) {
      return {
        isValid: false,
        error: 'Unsupported file format. Please upload a PDF or DOCX file.',
        fileSizeKB,
        fileName: file.name,
        fileType: file.type
      };
    }

    return {
      isValid: true,
      fileSizeKB,
      fileName: file.name,
      fileType: file.type
    };
  }

  static async extractText(file: File): Promise<string> {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid file');
    }

    const fileNameLower = file.name.toLowerCase();

    if (fileNameLower.endsWith('.pdf')) {
      return this.extractFromPDF(file);
    } else if (fileNameLower.endsWith('.docx')) {
      return this.extractFromDOCX(file);
    }

    throw new Error('Unsupported document format');
  }

  private static async extractFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      const trimmed = fullText.trim();
      if (!trimmed) {
        throw new Error('PDF document appears empty or unreadable.');
      }
      return trimmed;
    } catch (e: any) {
      console.error('PDF extraction failed:', e);
      throw new Error(`Could not extract readable text from PDF: ${e.message || 'Parse error'}`);
    }
  }

  private static async extractFromDOCX(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const trimmed = (result.value || '').trim();
      if (!trimmed) {
        throw new Error('DOCX document contains no readable text.');
      }
      return trimmed;
    } catch (e: any) {
      console.error('DOCX extraction failed:', e);
      throw new Error(`Could not extract readable text from DOCX: ${e.message || 'Parse error'}`);
    }
  }
}
