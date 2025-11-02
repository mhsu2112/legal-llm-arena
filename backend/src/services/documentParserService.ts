import mammoth from 'mammoth';
import fs from 'fs';

export interface ParsedDocument {
  fileName: string;
  content: string;
  error?: string;
}

/**
 * Parse a PDF file and extract text content
 */
export async function parsePdf(filePath: string, fileName: string): Promise<ParsedDocument> {
  try {
    // Use dynamic import for pdf-parse (CommonJS module)
    const pdfParse = (await import('pdf-parse')).default;

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Limit content length (100K characters ~25K tokens)
    const maxLength = 100000;
    const content = data.text.length > maxLength
      ? data.text.substring(0, maxLength) + '\n\n[Content truncated due to length...]'
      : data.text;

    return {
      fileName,
      content,
    };
  } catch (error: any) {
    console.error(`Error parsing PDF ${fileName}:`, error.message);
    return {
      fileName,
      content: '',
      error: error.message || 'Failed to parse PDF',
    };
  }
}

/**
 * Parse a DOCX file and extract text content
 */
export async function parseDocx(filePath: string, fileName: string): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });

    // Limit content length (100K characters ~25K tokens)
    const maxLength = 100000;
    const content = result.value.length > maxLength
      ? result.value.substring(0, maxLength) + '\n\n[Content truncated due to length...]'
      : result.value;

    return {
      fileName,
      content,
    };
  } catch (error: any) {
    console.error(`Error parsing DOCX ${fileName}:`, error.message);
    return {
      fileName,
      content: '',
      error: error.message || 'Failed to parse DOCX',
    };
  }
}

/**
 * Parse a text file
 */
export async function parseText(filePath: string, fileName: string): Promise<ParsedDocument> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Limit content length (100K characters ~25K tokens)
    const maxLength = 100000;
    const truncatedContent = content.length > maxLength
      ? content.substring(0, maxLength) + '\n\n[Content truncated due to length...]'
      : content;

    return {
      fileName,
      content: truncatedContent,
    };
  } catch (error: any) {
    console.error(`Error reading text file ${fileName}:`, error.message);
    return {
      fileName,
      content: '',
      error: error.message || 'Failed to read text file',
    };
  }
}

/**
 * Parse a document based on its file extension
 */
export async function parseDocument(filePath: string, fileName: string): Promise<ParsedDocument> {
  const extension = fileName.toLowerCase().split('.').pop();

  switch (extension) {
    case 'pdf':
      return parsePdf(filePath, fileName);
    case 'docx':
    case 'doc':
      return parseDocx(filePath, fileName);
    case 'txt':
    case 'text':
      return parseText(filePath, fileName);
    default:
      return {
        fileName,
        content: '',
        error: `Unsupported file type: ${extension}`,
      };
  }
}

/**
 * Parse multiple documents
 */
export async function parseDocuments(files: Array<{ path: string; originalname: string }>): Promise<ParsedDocument[]> {
  const promises = files.map(file => parseDocument(file.path, file.originalname));
  return Promise.all(promises);
}
