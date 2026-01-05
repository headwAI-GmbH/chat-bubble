import { createAPIClient } from './client.js';

/**
 * HeadwAI Titles API module
 * Handles title generation for chat conversations
 */
export class TitlesAPI {
  constructor(baseUrl, apiKey = null) {
    this.client = createAPIClient(baseUrl, apiKey);
  }

  /**
   * Generate a title for a chat conversation
   * @param {string} assistantId - Assistant ID (model) to use for title generation
   * @param {Array} messages - Array of chat messages for context
   * @param {string} [chatId] - Optional chat ID
   * @returns {Promise<string|null>} Generated title on success, null on failure
   */
  async createTitle(assistantId, messages, chatId = null) {
    const requestData = {
      model: assistantId,
      messages: messages,
      ...(chatId && { chat_id: chatId }),
    };

    const result = await this.client.post('/api/v1/tasks/title/completions', requestData);

    if (result && result.choices && result.choices[0] && result.choices[0].message) {
      const titleContent = result.choices[0].message.content;
      
      // Try to parse as JSON first (expected format)
      try {
        const titleData = JSON.parse(titleContent);
        return titleData.title;
      } catch (e) {
        // Fallback if JSON parsing fails - use raw content
        return titleContent;
      }
    }

    return null;
  }
}

/**
 * Create a new Titles API instance
 * @param {string} baseUrl - Base URL for the API
 * @returns {TitlesAPI} Titles API instance
 */
export function createTitlesAPI(baseUrl) {
  return new TitlesAPI(baseUrl);
}