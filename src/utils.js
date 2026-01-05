import { logger } from './logger.js';

/**
 * Generate a UUID v4 string
 * @returns {string} A UUID v4 string
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Extract and deduplicate references from response sources metadata
 * @param {Object} response - The response object containing sources
 * @returns {Array} Array of unique reference objects
 */
export function extractReferences(response) {
  // Check if response has sources with metadata
  if (
    !response.sources ||
    !Array.isArray(response.sources) ||
    response.sources.length === 0
  ) {
    return [];
  }

  const source = response.sources[0];
  if (!source.metadata || !Array.isArray(source.metadata)) {
    return [];
  }

  logger.log('Found sources metadata:', source.metadata);

  // Create a Set to track unique references based on a combination of key properties
  const uniqueReferences = new Map();

  source.metadata.forEach((item, index) => {
    // Skip invalid items
    if (!item || typeof item !== 'object') {
      logger.warn(`Skipping invalid metadata item at index ${index}:`, item);
      return;
    }

    // Create a unique key based on the important properties of the reference
    // Adjust these properties based on your actual metadata structure
    const title = item.title || item.name || item.filename || '';
    const url = item.url || item.link || item.uri || '';
    const source = item.source || item.type || '';

    const uniqueKey = JSON.stringify({
      title: title.trim(),
      url: url.trim(),
      source: source.trim(),
    });

    // Only add if we haven't seen this reference before and has meaningful content
    if (!uniqueReferences.has(uniqueKey) && (title || url)) {
      uniqueReferences.set(uniqueKey, {
        title: title || 'Untitled',
        url: url,
        source: source,
        description: item.description || item.snippet || item.content || '',
        page: item.page || '',
        ...item, // Include any other properties from the original metadata
      });
    }
  });

  const result = Array.from(uniqueReferences.values());
  logger.log(
    `Extracted ${result.length} unique references from ${source.metadata.length} metadata items`,
  );

  return result;
}

/**
 * Format references as Markdown for display in the chat
 * @param {Array} references - Array of reference objects
 * @param {string} messageContent - The message content to check for inline citations
 * @returns {string} Markdown string of formatted references
 */
export function formatReferencesAsMarkdown(references, messageContent = '') {
  if (!references || references.length === 0) {
    return '';
  }

  // Extract inline citation numbers from the message content
  const citationMatches = messageContent.match(/\[(\d+)\]/g);
  if (!citationMatches) {
    // No inline citations found, don't include any references
    return '';
  }

  // Extract the numbers from the citations and convert to 0-based indices
  const citedIndices = new Set();
  citationMatches.forEach((match) => {
    const number = parseInt(match.slice(1, -1));
    if (number > 0 && number <= references.length) {
      citedIndices.add(number - 1); // Convert to 0-based index
    }
  });

  if (citedIndices.size === 0) {
    // No valid citations found
    return '';
  }

  // Filter and format only the cited references
  const citedReferences = Array.from(citedIndices)
    .sort((a, b) => a - b) // Sort indices
    .map((index) => {
      const ref = references[index];
      const name = ref.name || 'Untitled Reference';
      return `**[${index + 1}]** ${name}`;
    });

  return `\n\n---\n\n**References:**\n\n${citedReferences.join('\n\n')}`;
}

/**
 * Remove references section from message content
 * @param {string} messageContent - The message content that may contain references
 * @returns {string} Message content with references removed
 */
export function removeReferences(messageContent) {
  if (!messageContent || typeof messageContent !== 'string') {
    return messageContent;
  }

  // Remove the references section that starts with "\n\n---\n\n**References:**"
  const referencesPattern = /\n\n---\n\n\*\*References:\*\*[\s\S]*$/;
  const cleanedContent = messageContent.replace(referencesPattern, '');

  return cleanedContent.trim();
}

/**
 * Log the message history for debugging purposes
 * @param {Array} messageHistory - Array of message objects containing content, html and role
 */
export function logMessageHistory(messageHistory) {
  logger.group('Message History');
  if (messageHistory.length === 0) {
    logger.log('No messages in history');
    return;
  }

  messageHistory.forEach((message, index) => {
    // Handle both content (text messages) and html (feedback messages)
    const messageText = message.content || message.html || '';
    const contentPreview =
      messageText.length > 50
        ? messageText.substring(0, 50) + '...'
        : messageText;
    logger.log(
      `${index + 1}. ${message.role.toUpperCase()}: ${contentPreview}`,
    );
  });
  logger.groupEnd();
}
