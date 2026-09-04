/**
 * Converts an HTML string into clean, readable plain text.
 * Strips all HTML tags, decodes common HTML entities, and normalizes whitespace.
 */
export const htmlToText = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

/**
 * Checks if HTML string has meaningful content (not just empty tags or spaces).
 */
export const isHtmlEmpty = (html) => {
  if (!html || typeof html !== 'string') return true;
  const text = htmlToText(html);
  return text.length === 0;
};
