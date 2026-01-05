import { logger } from '../logger.js';

/**
 * Base HTTP client for HeadwAI API calls
 * Provides common functionality like error handling, request configuration, and logging
 */
export class HeadwAIAPIClient {
  constructor(baseUrl, apiKey = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Request payload
   * @param {Object} options - Additional request options
   * @returns {Promise<Object|null>} Response data or null on error
   */
  async post(endpoint, data, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      };

      // Add API key to Authorization header if available
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const requestConfig = {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        ...options,
      };

      logger.log(`API POST Request to ${url}`, { data });

      const response = await fetch(url, requestConfig);

      if (response.ok) {
        const result = await response.json();
        logger.log(`API POST Success for ${endpoint}:`, result);
        return result;
      } else {
        const errorData = await response.json().catch(() => null);
        logger.error(
          `API POST Failed for ${endpoint}:`,
          response.status,
          response.statusText,
          errorData,
        );
        return null;
      }
    } catch (error) {
      logger.error(`API POST Error for ${endpoint}:`, error);
      return null;
    }
  }

  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint path
   * @param {Object} options - Additional request options
   * @returns {Promise<Object|null>} Response data or null on error
   */
  async get(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const headers = {
        Accept: 'application/json',
        ...options.headers,
      };

      // Add API key to Authorization header if available
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const requestConfig = {
        method: 'GET',
        headers,
        ...options,
      };

      logger.log(`API GET Request to ${url}`);

      const response = await fetch(url, requestConfig);

      if (response.ok) {
        const result = await response.json();
        logger.log(`API GET Success for ${endpoint}:`, result);
        return result;
      } else {
        const errorData = await response.json().catch(() => null);
        logger.error(
          `API GET Failed for ${endpoint}:`,
          response.status,
          response.statusText,
          errorData,
        );
        return null;
      }
    } catch (error) {
      logger.error(`API GET Error for ${endpoint}:`, error);
      return null;
    }
  }
}

/**
 * Create a new HeadwAI API client instance
 * @param {string} baseUrl - Base URL for the API
 * @param {string} apiKey - Optional API key for authentication
 * @returns {HeadwAIAPIClient} API client instance
 */
export function createAPIClient(baseUrl, apiKey = null) {
  return new HeadwAIAPIClient(baseUrl, apiKey);
}