import https from 'https';
import http from 'http';
import { URL } from 'url';

export interface FetchedUrlContent {
  url: string;
  content: string;
  error?: string;
}

/**
 * Fetch and extract text content from a URL
 */
export async function fetchUrlContent(url: string): Promise<FetchedUrlContent> {
  try {
    // Validate URL
    const parsedUrl = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        url,
        content: '',
        error: 'Only HTTP and HTTPS URLs are supported',
      };
    }

    const content = await fetchHttp(url);

    // Basic HTML stripping (removes tags, keeps text)
    const textContent = stripHtml(content);

    // Limit content length (100K characters ~25K tokens)
    const maxLength = 100000;
    const truncatedContent = textContent.length > maxLength
      ? textContent.substring(0, maxLength) + '\n\n[Content truncated due to length...]'
      : textContent;

    return {
      url,
      content: truncatedContent,
    };
  } catch (error: any) {
    console.error(`Error fetching URL ${url}:`, error.message);
    return {
      url,
      content: '',
      error: error.message || 'Failed to fetch URL',
    };
  }
}

/**
 * Fetch multiple URLs in parallel
 */
export async function fetchMultipleUrls(urls: string[]): Promise<FetchedUrlContent[]> {
  const promises = urls.map(url => fetchUrlContent(url));
  return Promise.all(promises);
}

/**
 * Fetch content via HTTP/HTTPS
 */
function fetchHttp(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Legal-LLM-Arena/1.0',
        'Accept': 'text/html,application/xhtml+xml,text/plain',
      },
      timeout: 10000, // 10 second timeout
    };

    const req = protocol.request(options, (res) => {
      // Handle redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).toString();
        fetchHttp(redirectUrl).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      let data = '';
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        data += chunk;
        // Prevent extremely large responses
        if (data.length > 5000000) { // 5MB limit
          req.destroy();
          reject(new Error('Response too large'));
        }
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Strip HTML tags and extract text content
 */
function stripHtml(html: string): string {
  // Remove script and style elements
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n\n');

  return text.trim();
}
