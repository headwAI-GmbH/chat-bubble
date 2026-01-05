import { createAPIClient } from './client.js';

/**
 * HeadwAI Tags API module
 * Handles all tags-related API operations
 */
export class TagsAPI {
  constructor(baseUrl, apiKey = null) {
    this.client = createAPIClient(baseUrl, apiKey);
  }

  /**
   * Generate tags for a conversation using AI
   * @param {string} assistantId - Assistant/model ID to use for tag generation
   * @param {Array} messages - Chat messages to analyze for tag generation
   * @param {string} chatId - Chat ID for context
   * @returns {Promise<Object|null>} Tags response object on success, null on failure
   */
  async createTags(assistantId, messages, chatId) {
    try {
      const requestBody = {
        model: assistantId,
        messages: messages,
        chat_id: chatId,
      };

      const result = await this.client.post(
        '/api/v1/tasks/tags/completions',
        requestBody,
      );

      return result;
    } catch (error) {
      console.error('Failed to generate tags:', error);
      return null;
    }
  }
}

/**
 * Create a new Tags API instance
 * @param {string} baseUrl - Base URL for the API
 * @returns {TagsAPI} Tags API instance
 */
export function createTagsAPI(baseUrl) {
  return new TagsAPI(baseUrl);
}
