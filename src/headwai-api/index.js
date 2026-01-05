/**
 * HeadwAI API Module
 * Centralized API client for all HeadwAI services
 */

export { HeadwAIAPIClient, createAPIClient } from './client.js';
export { ChatsAPI, createChatsAPI } from './chats.js';
export { EvaluationsAPI, createEvaluationsAPI } from './evaluations.js';
export { TagsAPI, createTagsAPI } from './tags.js';
export { TitlesAPI, createTitlesAPI } from './titles.js';

// Import the classes for use in createHeadwAIAPI
import { ChatsAPI } from './chats.js';
import { EvaluationsAPI } from './evaluations.js';
import { TagsAPI } from './tags.js';
import { TitlesAPI } from './titles.js';

/**
 * Create a complete HeadwAI API instance with all services
 * @param {string} baseUrl - Base URL for the API
 * @param {string} apiKey - Optional API key for authentication
 * @returns {Object} Object containing all API service instances
 */
export function createHeadwAIAPI(baseUrl, apiKey = null) {
  return {
    chats: new ChatsAPI(baseUrl, apiKey),
    evaluations: new EvaluationsAPI(baseUrl, apiKey),
    tags: new TagsAPI(baseUrl, apiKey),
    titles: new TitlesAPI(baseUrl, apiKey),
  };
}
