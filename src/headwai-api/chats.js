import { createAPIClient } from './client.js';
import { generateUUID } from '../utils.js';
import {
  DEEP_CHAT_FEEDBACK_ROLE,
  HEADWAI_ASSISTANT_ROLE,
  USER_ROLE,
} from '../constants.js';

/**
 * HeadwAI Chats API module
 * Handles all chat-related API operations
 */
export class ChatsAPI {
  constructor(baseUrl, apiKey = null) {
    this.client = createAPIClient(baseUrl, apiKey);
  }

  /**
   * Create a new chat session
   * @param {string} assistantId - Assistant ID to use for the chat
   * @param {string} initialAssistantMessage - Initial assistant message content
   * @param {string} [initialUserMessage] - Optional initial user message content
   * @returns {Promise<Object|null>} Chat object with id and messages on success, null on failure
   */
  async createNewChat(assistantId, initialAssistantMessage) {
    const timestamp = Math.floor(Date.now() / 1000);

    // Create message objects for the initial conversation
    const messages = [];
    const historyMessages = {};

    // Create initial assistant message
    const initialAssistantMessageId = generateUUID();

    const initialAssistantMessageObj = {
      id: initialAssistantMessageId,
      parentId: null,
      childrenIds: [],
      role: HEADWAI_ASSISTANT_ROLE,
      content: initialAssistantMessage,
      model: assistantId,
      modelId: assistantId,
      modelIdx: 0,
      timestamp: timestamp,
    };

    messages.push(initialAssistantMessageObj);
    historyMessages[initialAssistantMessageId] = initialAssistantMessageObj;

    const chatData = {
      assistantId: assistantId,
      chat: {
        id: '',
        title: 'New Chatbubble Chat',
        models: [assistantId],
        params: {},
        history: {
          messages: historyMessages,
          currentId: initialAssistantMessageId,
        },
        messages: messages,
        tags: [],
        timestamp: Date.now(),
      },
      folder_id: null,
    };

    return await this.client.post('/api/v1/chats/new', chatData);
  }

  /**
   * Store chat history to the backend
   * @param {string} chatId - Chat ID
   * @param {string} assistantId - Assistant ID
   * @param {Array} messageHistory - Current message history
   * @param {string} [title] - Optional chat title to update
   * @returns {Promise<Object|null>} API response object on success, null on failure
   */
  async storeChatHistory(chatId, assistantId, messageHistory, title = null) {
    if (!chatId) {
      throw new Error('No chat ID available to store history');
    }

    // Filter out feedback messages and fix parent-child relationships
    const filteredMessageHistory =
      this.filterFeedbackMessagesAndFixRelationships(messageHistory);

    // Build the history structure for the API
    const historyMessages = {};
    filteredMessageHistory.forEach((msg) => {
      historyMessages[msg.id] = msg;
    });

    // Find the latest assistant message for currentId
    const assistantMessages = filteredMessageHistory.filter(
      (msg) => msg.role === HEADWAI_ASSISTANT_ROLE,
    );
    const latestAssistantMessage =
      assistantMessages[assistantMessages.length - 1];

    const chatData = {
      ...(title && { title: title }),
      assistantId: assistantId,
      chat: {
        files: [],
        models: [assistantId],
        history: {
          messages: historyMessages,
          currentId: latestAssistantMessage?.id || null,
        },
        messages: filteredMessageHistory,
        params: {},
        ...(title && { title: title }),
      },
    };

    return await this.client.post(`/api/v1/chats/${chatId}`, chatData);
  }

  /**
   * Filter out feedback messages and fix parent-child relationships
   * @param {Array} messageHistory - Current message history
   * @returns {Array} Filtered message history with corrected relationships
   */
  filterFeedbackMessagesAndFixRelationships(messageHistory) {
    // First, filter out feedback messages
    const nonFeedbackMessages = messageHistory.filter(
      (msg) => msg.role !== DEEP_CHAT_FEEDBACK_ROLE,
    );

    // Create a deep copy to avoid modifying the original messages
    const filteredMessages = nonFeedbackMessages.map((msg) => ({
      ...msg,
      childrenIds: [...(msg.childrenIds || [])],
    }));

    // Create maps for quick lookup
    const messageMap = new Map();
    const feedbackMessages = new Set();

    messageHistory.forEach((msg) => {
      messageMap.set(msg.id, msg);
      if (msg.role === DEEP_CHAT_FEEDBACK_ROLE) {
        feedbackMessages.add(msg.id);
      }
    });

    // Fix parent-child relationships for each filtered message
    filteredMessages.forEach((msg) => {
      // Fix childrenIds - remove feedback message IDs and replace with their non-feedback children
      const newChildrenIds = [];

      (msg.childrenIds || []).forEach((childId) => {
        if (feedbackMessages.has(childId)) {
          // This child is a feedback message, find its non-feedback children
          const feedbackMsg = messageMap.get(childId);
          if (feedbackMsg && feedbackMsg.childrenIds) {
            feedbackMsg.childrenIds.forEach((grandChildId) => {
              if (!feedbackMessages.has(grandChildId)) {
                newChildrenIds.push(grandChildId);
              }
            });
          }
        } else {
          // This child is not a feedback message, keep it
          newChildrenIds.push(childId);
        }
      });

      msg.childrenIds = newChildrenIds;

      // Fix parentId - if parent is a feedback message, find its non-feedback parent
      if (msg.parentId && feedbackMessages.has(msg.parentId)) {
        let currentParent = messageMap.get(msg.parentId);

        // Walk up the chain until we find a non-feedback parent
        while (currentParent && feedbackMessages.has(currentParent.id)) {
          currentParent = currentParent.parentId
            ? messageMap.get(currentParent.parentId)
            : null;
        }

        msg.parentId = currentParent ? currentParent.id : null;
      }
    });

    return filteredMessages;
  }

  /**
   * Update assistant message with feedback information
   * @param {string} chatId - Chat ID
   * @param {string} assistantId - Assistant ID
   * @param {Array} messageHistory - Current message history
   * @param {string} [title] - Optional chat title to update
   * @returns {Promise<Object|null>} API response object on success, null on failure
   */
  async updateAssistantMessageWithFeedback(
    chatId,
    assistantId,
    messageHistory,
    title = null,
  ) {
    return this.storeChatHistory(chatId, assistantId, messageHistory, title);
  }

  /**
   * Store a single tag for a chat
   * @param {string} chatId - Chat ID
   * @param {string} assistantId - Assistant ID
   * @param {string} tagName - Tag name to store
   * @returns {Promise<Object|null>} API response object on success, null on failure
   */
  async storeTag(chatId, assistantId, tagName) {
    if (!chatId) {
      throw new Error('No chat ID available to store tag');
    }

    const tagData = {
      name: tagName.trim(),
      assistantId: assistantId,
    };

    return await this.client.post(`/api/v1/chats/${chatId}/tags`, tagData);
  }
}

/**
 * Create a new Chats API instance
 * @param {string} baseUrl - Base URL for the API
 * @returns {ChatsAPI} Chats API instance
 */
export function createChatsAPI(baseUrl) {
  return new ChatsAPI(baseUrl);
}
