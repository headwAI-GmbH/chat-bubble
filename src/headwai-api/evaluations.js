import { createAPIClient } from './client.js';

/**
 * HeadwAI Evaluations API module
 * Handles all evaluation and feedback-related API operations
 */
export class EvaluationsAPI {
  constructor(baseUrl, apiKey = null) {
    this.client = createAPIClient(baseUrl, apiKey);
  }

  /**
   * Send feedback for a message
   * @param {Object} feedbackParams - Feedback parameters
   * @param {string} feedbackParams.assistantId - Assistant ID
   * @param {string} feedbackParams.messageId - Message ID to provide feedback for
   * @param {number} feedbackParams.rating - Rating value (1 for positive, -1 for negative)
   * @param {string} feedbackParams.chatId - Chat ID
   * @param {Array} feedbackParams.messageHistory - Current message history
   * @returns {Promise<Object|null>} Feedback result on success, null on failure
   */
  async sendFeedback({
    assistantId,
    messageId,
    rating,
    chatId,
    messageHistory,
  }) {
    if (!chatId) {
      throw new Error('No chat ID available to send feedback');
    }

    const message = messageHistory.find((msg) => msg.id === messageId);
    if (!message) {
      throw new Error(`Message not found in history for feedback ID: ${messageId}`);
    }

    const messageIndex = messageHistory.findIndex((msg) => msg.id === messageId);

    const feedbackData = {
      assistantId: assistantId,
      type: 'rating',
      data: {
        rating: rating,
        model_id: assistantId,
      },
      meta: {
        model_id: assistantId,
        message_id: messageId,
        message_index: messageIndex,
        chat_id: chatId,
        base_models: {
          [assistantId]: assistantId, // Using the same ID as both key and value
        },
      },
      snapshot: {
        chat: {
          id: chatId,
          user_id: null, // This might need to be filled if user ID is available
          title: 'New Chatbubble Chat',
          chat: {
            id: '',
            title: 'New Chatbubble Chat',
            models: [assistantId],
            params: {},
            history: {
              messages: {},
              currentId: messageId,
            },
            messages: messageHistory,
            params: {},
          },
          updated_at: Date.now(),
          created_at: Date.now(),
          share_id: null,
          archived: false,
          pinned: false,
          meta: {},
          folder_id: null,
        },
      },
    };

    // Build snapshot messages
    const snapshotMessages = {};
    messageHistory.forEach((msg) => {
      snapshotMessages[msg.id] = msg;
    });
    feedbackData.snapshot.chat.chat.history.messages = snapshotMessages;
    feedbackData.snapshot.chat.chat.history.currentId =
      messageHistory[messageHistory.length - 1]?.id;

    const result = await this.client.post('/api/v1/evaluations/feedback', feedbackData);
    return result;
  }
}

/**
 * Create a new Evaluations API instance
 * @param {string} baseUrl - Base URL for the API
 * @returns {EvaluationsAPI} Evaluations API instance
 */
export function createEvaluationsAPI(baseUrl) {
  return new EvaluationsAPI(baseUrl);
}