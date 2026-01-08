<div class="chat-content">
  <deep-chat
    bind:this={deepChatRef}
    {chatStyle}
    {textInput}
    {messageStyles}
    demo="false"
    history={deepChatHistory}
    {connect}
    {requestBodyLimits}
    {requestInterceptor}
    {responseInterceptor}
    onMessage={handleMessage}
    {submitButtonStyles}
  />
</div>

<script>
  import { getContext, onMount } from 'svelte';
  import {
    removeReferences,
    extractReferences,
    generateUUID,
    logMessageHistory,
    formatReferencesAsMarkdown,
  } from '../utils.js';
  import {
    currentUserMessageContent,
    currentAssistantMessageSources,
    currentReferences,
    currentAssistantMessageContent,
    currentAssistantMessageId,
    currentUserMessageId,
    chatId,
    messageHistory,
    isChatOpen,
    generatedChatTitle,
  } from '../stores.js';
  import { logger } from '../logger.js';
  import { createHeadwAIAPI } from '../headwai-api/index.js';
  import {
    HEADWAI_ASSISTANT_ROLE,
    DEEP_CHAT_ASSISTANT_ROLE,
    USER_ROLE,
    DEEP_CHAT_FEEDBACK_ROLE,
  } from '../constants.js';

  export let deepChatRef;
  export let placeholderText;
  export let fontFamily;
  export let fontSize;
  export let userMessageBackgroundColor;
  export let userMessageTextColor;
  export let aiMessageBackgroundColor;
  export let aiMessageTextColor;
  export let feedbackMessageBackgroundColor;
  export let feedbackMessageTextColor;
  export let initialHistory;
  export let apiUrl;
  export let apiKey;
  export let assistantId;
  export let maxMessages;
  export let submitButtonBackgroundColor;

  // Initialize HeadwAI API instance
  const headwaiAPI = createHeadwAIAPI(apiUrl, apiKey);

  // Get translation function store from context
  const t = getContext('i18n');

  // Track if we've received the first AI response to generate a title
  let firstResponseReceived = false;

  const submitButtonStyles = {
    submit: {
      container: {
        default: {
          backgroundColor: submitButtonBackgroundColor,
          marginBottom: '0.05em',
          width: '1.8em',
          height: '1.8em',
        },
        hover: {
          backgroundColor: submitButtonBackgroundColor,
          opacity: '0.8',
        },
        click: {
          backgroundColor: submitButtonBackgroundColor,
          opacity: '0.6',
        },
      },
      svg: {
        styles: {
          default: {
            filter: 'brightness(0) saturate(100%) invert(100%)', // Makes SVG white
          },
          hover: {
            filter: 'brightness(0) saturate(100%) invert(100%)', // Keep white on hover
          },
          click: {
            filter: 'brightness(0) saturate(100%) invert(100%)', // Keep white on click
          },
        },
      },
    },
    loading: {
      container: {
        default: {
          backgroundColor: submitButtonBackgroundColor,
        },
        hover: {
          backgroundColor: submitButtonBackgroundColor,
          opacity: '0.8',
        },
        click: {
          backgroundColor: submitButtonBackgroundColor,
          opacity: '0.6',
        },
      },
      svg: {
        content: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
          </circle>
        </svg>`,
        styles: {
          default: {
            filter: 'brightness(0) saturate(100%) invert(100%)', // Makes loading SVG white
          },
          hover: {
            filter: 'brightness(0) saturate(100%) invert(100%)', // Keep white on hover
          },
          click: {
            filter: 'brightness(0) saturate(100%) invert(100%)', // Keep white on click
          },
        },
      },
    },
    stop: {
      container: {
        default: {
          backgroundColor: submitButtonBackgroundColor,
        },
        hover: {
          backgroundColor: submitButtonBackgroundColor,
          opacity: '0.8',
        },
        click: {
          backgroundColor: submitButtonBackgroundColor,
          opacity: '0.6',
        },
      },
      svg: {
        content: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
        </svg>`,
        styles: {
          default: {
            filter: 'brightness(0) saturate(100%) invert(100%)', // Makes stop SVG white
          },
          hover: {
            filter: 'brightness(0) saturate(100%) invert(100%)', // Keep white on hover
          },
          click: {
            filter: 'brightness(0) saturate(100%) invert(100%)', // Keep white on click
          },
        },
      },
    },
    alwaysEnabled: true,
    position: 'outside-right',
  };

  const chatStyle = {
    fontSize: fontSize,
    fontFamily: fontFamily,
  };

  // Configure text input with customizable placeholder
  const textInput = {
    placeholder: {
      text: placeholderText,
    },
  };

  // Configure message styles with customizable background colors
  const messageStyles = {
    default: {
      user: {
        bubble: {
          backgroundColor: userMessageBackgroundColor,
          color: userMessageTextColor,
        },
      },
      ai: {
        bubble: {
          backgroundColor: aiMessageBackgroundColor,
          color: aiMessageTextColor,
        },
      },
      feedback: {
        bubble: {
          backgroundColor: feedbackMessageBackgroundColor,
          color: feedbackMessageTextColor,
        },
      },
    },
  };

  // Function to transform messageHistory format to deep-chat format
  function transformMessagesHeadwaiToDeepChat(messages) {
    return messages.map((msg) => {
      const transformed = transformMessageHeadwaiToDeepChat(msg);
      return {
        ...transformed,
        custom: { timestamp: msg.timestamp || Math.floor(Date.now() / 1000) },
      };
    });
  }

  // Static history for deep-chat - only set once when component loads
  let deepChatHistory = initialHistory;

  // Reactive connect configuration that includes API key if provided
  const connect = {
    type: 'websocket',
    url: (() => {
      return `${apiUrl}/api/chat/completions`;
    })(),
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    },
    additionalBodyProps: {
      // background_tasks: {
      //   title_generation: true,
      //   tags_generation: true,
      //   follow_up_generation: false,
      // },
      ...($chatId && { chat_id: $chatId }), // Include chat_id only if we have one
      features: {
        image_generation: false,
        code_interpreter: false,
        web_search: false,
        memory: false,
      },
      id: '', // placeholder for current user message
      model: assistantId,
      // model_item: {} // placeholder for model item if needed
      params: {},
      parent_id: '', // placeholder for parent message ID
      // session_id: 'chat-bubble-session', // placeholder for session ID
      stream: true, // Ensure the API endpoint knows we want streaming
      tool_servers: [],
      variables: {
        '{{USER_NAME}}': 'David Schneebauer | headwAI GmbH',
        '{{USER_LOCATION}}': 'Unknown',
        '{{CURRENT_DATETIME}}': new Date()
          .toISOString()
          .slice(0, 19)
          .replace('T', ' '),
        '{{CURRENT_DATE}}': new Date().toISOString().slice(0, 10),
        '{{CURRENT_TIME}}': new Date().toTimeString().slice(0, 8),
        '{{CURRENT_WEEKDAY}}': new Date().toLocaleDateString('en-US', {
          weekday: 'long',
        }),
        '{{CURRENT_TIMEZONE}}':
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        '{{USER_LANGUAGE}}': 'en-GB',
      },
    },
    stream: true,
  };

  // Configure request body limits to include conversation history
  const requestBodyLimits = {
    maxMessages: maxMessages,
  };

  function transformMessagesFromDeepChatToHeadwai(messages) {
    return messages.map((message) => {
      console.log('Transforming message from deep-chat to headwAI:', message);
      return {
        role:
          message.role === DEEP_CHAT_ASSISTANT_ROLE
            ? HEADWAI_ASSISTANT_ROLE
            : message.role,
        content: message.text || '',
      };
    });
  }

  function removeReferencesFromMessages(messages) {
    return messages.map((message) => {
      if (message.role === HEADWAI_ASSISTANT_ROLE && message.content) {
        message.content = removeReferences(message.content);
      }
      return message;
    });
  }

  function removeFeedbackMessages(messages) {
    return messages.filter(
      (message) => message.role !== DEEP_CHAT_FEEDBACK_ROLE,
    );
  }

  function getCurrentUserMessageContent(messages) {
    const userMessages = messages.filter((msg) => msg.role === USER_ROLE);
    if (userMessages.length > 0) {
      return userMessages[userMessages.length - 1].content;
    }
    return null;
  }

  function transformMessageHeadwaiToDeepChat(message) {
    // Handle feedback messages with HTML content
    if (message.role === DEEP_CHAT_FEEDBACK_ROLE && message.html) {
      return {
        role: DEEP_CHAT_FEEDBACK_ROLE,
        html: message.html,
      };
    }

    return {
      role:
        message.role === HEADWAI_ASSISTANT_ROLE
          ? DEEP_CHAT_ASSISTANT_ROLE
          : message.role,
      text: message.content,
    };
  }

  function addReferences(messageText) {
    // Format and append references markdown to the message if we have any
    if ($currentReferences.length > 0 && deepChatRef) {
      logger.log('📚 Formatting and updating AI message with references');

      // Format references based on inline citations in the message content
      const referencesMarkdown = formatReferencesAsMarkdown(
        $currentReferences,
        messageText,
      );
      return messageText + referencesMarkdown;
    }

    return messageText;
  }

  /**
   * Generate tags for the current conversation using AI
   * @param {string} currentChatId - Snapshot of the current chat ID
   * @param {Array} currentMessages - Snapshot of the current deep-chat messages
   */
  async function generateChatTags(
    currentChatId = $chatId,
    currentMessages = null,
  ) {
    try {
      // Use provided messages or get current messages from deep-chat
      const messages = currentMessages || deepChatRef.getMessages();

      // Get the current chat messages for tag generation
      const chatMessages = removeReferencesFromMessages(
        transformMessagesFromDeepChatToHeadwai(
          removeFeedbackMessages(messages),
        ),
      );

      logger.log('🏷️ Generating tags for conversation...');
      const tagsResponse = await headwaiAPI.tags.createTags(
        assistantId,
        chatMessages,
        currentChatId,
      );

      if (
        tagsResponse &&
        tagsResponse.choices &&
        tagsResponse.choices[0] &&
        tagsResponse.choices[0].message
      ) {
        let messageContent = tagsResponse.choices[0].message.content;

        try {
          // Strip markdown code fences if present (e.g., ```json ... ```)
          const jsonMatch = messageContent.match(
            /```(?:json)?\s*\n?([\s\S]*?)\n?```/,
          );
          if (jsonMatch) {
            messageContent = jsonMatch[1].trim();
          }

          // Parse the JSON content from the message
          const parsedContent = JSON.parse(messageContent);

          if (parsedContent.tags && Array.isArray(parsedContent.tags)) {
            const generatedTags = parsedContent.tags;
            logger.log('🏷️ Tags generated:', generatedTags);

            // Save each tag to the backend individually
            if (currentChatId && generatedTags.length > 0) {
              logger.log('🏷️ Saving tags to backend...');
              // Save all tags concurrently and log results
              const tagPromises = generatedTags.map((tagName) =>
                headwaiAPI.chats.storeTag(currentChatId, assistantId, tagName),
              );
              const results = await Promise.allSettled(tagPromises);
              results.forEach((result, idx) => {
                const tagName = generatedTags[idx];
                if (result.status === 'fulfilled' && result.value) {
                  logger.log(`🏷️ Tag "${tagName.trim()}" saved successfully`);
                } else if (result.status === 'fulfilled' && !result.value) {
                  logger.error(`🏷️ Failed to save tag "${tagName.trim()}"`);
                } else if (result.status === 'rejected') {
                  logger.error(
                    `🏷️ Error saving tag "${tagName.trim()}":`,
                    result.reason,
                  );
                }
              });
            }
          } else {
            logger.warn(
              '🏷️ No tags array found in parsed response:',
              parsedContent,
            );
          }
        } catch (parseError) {
          logger.error(
            '🏷️ Failed to parse tags JSON:',
            parseError,
            'Content:',
            messageContent,
          );
        }
      } else {
        logger.warn('🏷️ No valid tags response structure:', tagsResponse);
      }
    } catch (error) {
      logger.error('🏷️ Failed to generate tags:', error);
    }
  }

  /**
   * Generate a title for the current conversation using AI
   * @param {string} currentChatId - Snapshot of the current chat ID
   * @param {Array} currentMessages - Snapshot of the current deep-chat messages
   */
  async function generateChatTitle(
    currentChatId = $chatId,
    currentMessages = null,
  ) {
    try {
      // Use provided messages or get current messages from deep-chat
      const messages = currentMessages || deepChatRef.getMessages();

      // Get the current chat messages for title generation
      const chatMessages = removeReferencesFromMessages(
        transformMessagesFromDeepChatToHeadwai(
          removeFeedbackMessages(messages),
        ),
      );

      logger.log('📝 Generating title for conversation...');
      const title = await headwaiAPI.titles.createTitle(
        assistantId,
        chatMessages,
        currentChatId,
      );

      if (title) {
        logger.log('📝 Title generated:', title);
        generatedChatTitle.set(title);
      } else {
        logger.warn('📝 No title generated from API');
      }
    } catch (error) {
      logger.error('📝 Failed to generate title:', error);
    }
  }

  const createFeedbackIconHtml = (
    type,
    title,
    pathD,
    messageId,
    feedbackMessageIndex,
    isActive = false,
  ) => `
      <span class="feedback-icon feedback-icon-${type}" title="${title}" onclick="window.handleFeedback('${messageId}', '${type}', '${feedbackMessageIndex}')" style="cursor: pointer;">
        <svg
          aria-hidden="true"
          stroke="currentColor"
          fill="${isActive ? 'currentColor' : 'none'}"
          stroke-width="2.3"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          style="width: 16px !important; height: 16px !important; min-width: 16px !important; min-height: 16px !important;"
        >
          <path d="${pathD}" />
        </svg>
      </span>
    `;

  function addFeedbackMessage() {
    // Find the current assistant message ID from message history
    // The feedback should be associated with the last assistant message
    const lastAssistantMessage = $messageHistory
      .filter((msg) => msg.role === HEADWAI_ASSISTANT_ROLE)
      .pop();

    logger.log('Last assistant message:', lastAssistantMessage);

    const assistantMessageId = lastAssistantMessage
      ? lastAssistantMessage.id
      : generateUUID();

    logger.log('Using assistant message ID for feedback:', assistantMessageId);

    const feedbackMessageIndex = deepChatRef.getMessages().length;

    const feedbackHtml = `
       <div class="feedback">
         <div class="feedback-icons">
           ${createFeedbackIconHtml(
             'positive',
             $t('chat.content.feedback.positive'),
             'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3',
             assistantMessageId,
             feedbackMessageIndex,
           )}
           ${createFeedbackIconHtml(
             'negative',
             $t('chat.content.feedback.negative'),
             'M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17',
             assistantMessageId,
             feedbackMessageIndex,
           )}
         </div>
       </div>
       `;

    // Add the feedback message to deep-chat
    deepChatRef.addMessage({
      html: feedbackHtml,
      role: DEEP_CHAT_FEEDBACK_ROLE,
    });

    // Store the feedback message in message history for persistence
    const feedbackMessageObj = {
      id: generateUUID(),
      parentId: assistantMessageId,
      childrenIds: [],
      role: DEEP_CHAT_FEEDBACK_ROLE,
      html: feedbackHtml,
      timestamp: Math.floor(Date.now() / 1000),
      associatedMessageId: assistantMessageId, // Link to the assistant message this feedback belongs to
    };

    // Add feedback message to history
    $messageHistory.push(feedbackMessageObj);

    // Update the assistant message's children to include the feedback
    if (lastAssistantMessage) {
      lastAssistantMessage.childrenIds = lastAssistantMessage.childrenIds || [];
      lastAssistantMessage.childrenIds.push(feedbackMessageObj.id);
    }
  }

  // Function to store message history with feedback messages
  async function storeFeedbackInHistory() {
    if (!$chatId) {
      logger.error('No chat ID available to store feedback history');
      return;
    }

    try {
      // Store chat history using the API (includes feedback messages)
      const success = await headwaiAPI.chats.storeChatHistory(
        $chatId,
        assistantId,
        $messageHistory,
        $generatedChatTitle,
      );

      if (success) {
        logger.log('Chat history with feedback stored successfully');
        logMessageHistory($messageHistory);
      } else {
        logger.error('Failed to store chat history with feedback');
      }
    } catch (error) {
      logger.error('Failed to store chat history with feedback:', error);
    }
  }

  const requestInterceptor = async (details) => {
    logger.log('Request interceptor called with details:', details);

    if (!$chatId) {
      logger.log('Creating new chat for first user message');
      await createNewChat();
    }
    
    if (details.body && details.body.messages) {
      // Generate new message IDs for this request if not already set
      if (!$currentUserMessageId) {
        currentUserMessageId.set(generateUUID());
      }
      if (!$currentAssistantMessageId) {
        currentAssistantMessageId.set(generateUUID());
      }
      
      details.body.chat_id = $chatId;
      details.body.id = $currentAssistantMessageId;
      details.body.parent_id = $currentUserMessageId;
      
      // Add parent message to the request body if available
      if ($messageHistory.length > 0) {
        // Get the last non-feedback message from history as the parent for the current user message
        const lastNonFeedbackMessage = [...$messageHistory]
          .reverse()
          .find(msg => msg.role !== DEEP_CHAT_FEEDBACK_ROLE);
        
        if (lastNonFeedbackMessage) {
          details.body.parent_message = {
            id: lastNonFeedbackMessage.id,
            parentId: lastNonFeedbackMessage.parentId || null,
            childrenIds: lastNonFeedbackMessage.childrenIds || [],
            role: lastNonFeedbackMessage.role,
            content: lastNonFeedbackMessage.content,
            timestamp: lastNonFeedbackMessage.timestamp,
            models: lastNonFeedbackMessage.models || [assistantId]
          };
        }
      }

      details.body.messages = removeReferencesFromMessages(
        transformMessagesFromDeepChatToHeadwai(details.body.messages),
      );

      // Filter out messages with the role 'feedback'
      details.body.messages = removeFeedbackMessages(details.body.messages);

      // Store the current user message for later use in response interceptor
      const currentUserContent = getCurrentUserMessageContent(
        details.body.messages,
      );
      if (currentUserContent) {
        currentUserMessageContent.set(currentUserContent);
      }
    }
    return details;
  };

  const responseInterceptor = (response) => {
    logger.log(response);

    // Store sources metadata for later use
    if (response.sources && Array.isArray(response.sources)) {
      currentAssistantMessageSources.set(response.sources);
      logger.log(`Found ${response.sources.length} sources in response`);
      logger.log('assistantMessageSources:', response.sources);
    }

    // Extract references from response if available (for both streaming and non-streaming)
    try {
      const references = extractReferences(response);
      if (references.length > 0) {
        // Store raw references for later formatting when we have the complete message
        currentReferences.set(references);
        logger.log(`Found ${references.length} references in response`);
      }
    } catch (error) {
      logger.error('Error extracting references:', error);
    }

    // Handle streaming responses - these come as server-sent events
    if (response.choices && response.choices[0] && response.choices[0].delta) {
      const delta = response.choices[0].delta;
      const content = delta.content || '';

      // Accumulate the streaming response
      if (content) {
        currentAssistantMessageContent.update((msg) => msg + content);
      }

      // Check if this is the end of the stream
      if (response.choices[0].finish_reason) {
        logger.log('Streaming response ended');
      }

      return transformMessageHeadwaiToDeepChat({
        role: delta.role,
        content: content,
      });
    }

    // Handle OpenAI chat completion format (non-streaming)
    if (
      response.choices &&
      response.choices[0] &&
      response.choices[0].message
    ) {
      const message = response.choices[0].message;
      logger.log('Non-streaming response received');

      return transformMessageHeadwaiToDeepChat({
        role: message.role,
        content: message.content,
      });
    }

    // If it's already in the correct format, return as is
    if (response.text || response.html || response.files) {
      return response;
    }

    // Fallback - try to extract text from response
    if (typeof response === 'string') {
      return { text: response };
    }

    return response;
  };

  // Function to create a new chat session
  async function createNewChat() {
    try {
      const result = await headwaiAPI.chats.createNewChat(
        assistantId,
        initialHistory[0].text,
      );

      if (result) {
        chatId.set(result.id);
        logger.log(`New chat created with ID: ${result.id}`);

        messageHistory.set(result.chat.messages);
        logMessageHistory(result.chat.messages);

        // Reset title generation tracking for new chat
        firstResponseReceived = false;
        generatedChatTitle.set(null);

        return result.id;
      } else {
        logger.error('Failed to create new chat');
        return null;
      }
    } catch (error) {
      logger.error('Failed to create new chat:', error);
      return null;
    }
  }

  // Function to handle onMessage event
  async function handleMessage(messageData) {
    const { message, isHistory } = messageData;
    logger.log(messageData);

    // Only process AI responses that are not from history
    if (!isHistory && message.role === DEEP_CHAT_ASSISTANT_ROLE) {
      logger.log('🤖 AI answered:', message.text);

      // Generate tags for the conversation (run in background with current state snapshot)
      generateChatTags($chatId, [...deepChatRef.getMessages()]);

      // Generate title for the conversation on first AI response
      if (!firstResponseReceived) {
        firstResponseReceived = true;
        await generateChatTitle($chatId, [...deepChatRef.getMessages()]);
      }

      deepChatRef.disableSubmitButton();

      const aiMessageWithReferences = addReferences(message.text || '');

      deepChatRef.updateMessage(
        { text: aiMessageWithReferences },
        deepChatRef.getMessages().length - 1,
      );

      deepChatRef.scrollToBottom();

      logger.log('$messageHistory before storing:', $messageHistory);
      logger.log('length:', $messageHistory.length);

      storeChatHistory(
        $currentUserMessageContent,
        $currentAssistantMessageContent,
        $currentAssistantMessageSources,
      );

      addFeedbackMessage();

      currentUserMessageContent.set('');
      currentAssistantMessageContent.set('');
      currentAssistantMessageSources.set([]);
      currentReferences.set([]);
      currentUserMessageId.set(null);
      currentAssistantMessageId.set(null);

      deepChatRef.disableSubmitButton(false);
    }
  }

  // Function to store chat history in the backend
  async function storeChatHistory(
    userMessage,
    assistantMessage,
    assistantMessageSources,
  ) {
    if (!$chatId) {
      logger.error('No chat ID available to store history');
      return;
    }

    logger.log('assistantMessageSources:', assistantMessageSources);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const models = [assistantId];

      // Create message IDs
      const userMessageId = generateUUID();
      const assistantMessageId = generateUUID();
      
      // Set current message IDs in stores
      currentUserMessageId.set(userMessageId);
      currentAssistantMessageId.set(assistantMessageId);

      // Find the previous message to link to
      const previousMessage = $messageHistory[$messageHistory.length - 1];

      // Create user message object
      const userMessageObj = {
        id: userMessageId,
        parentId: previousMessage ? previousMessage.id : null,
        childrenIds: [assistantMessageId],
        role: USER_ROLE,
        content: userMessage,
        timestamp: timestamp,
        models: models,
      };

      // Create assistant message object
      const assistantMessageObj = {
        id: assistantMessageId,
        parentId: userMessageId,
        childrenIds: [],
        role: HEADWAI_ASSISTANT_ROLE,
        content: assistantMessage,
        model: models[0],
        modelId: models[0], // You might want to map this to a display name
        modelIdx: 0,
        timestamp: timestamp,
        sources: assistantMessageSources,
      };

      // Update the previous message's children if it exists
      if (previousMessage) {
        previousMessage.childrenIds = [userMessageId];
      }

      // Add new messages to history (user and assistant messages only)
      // Note: feedback messages are added separately in addFeedbackMessages()
      $messageHistory.push(userMessageObj, assistantMessageObj);

      // Store chat history using the API
      const success = await headwaiAPI.chats.storeChatHistory(
        $chatId,
        assistantId,
        $messageHistory,
        $generatedChatTitle,
      );

      if (success) {
        logger.log('Chat history stored successfully');
        logMessageHistory($messageHistory);
      } else {
        logger.error('Failed to store chat history');
      }
    } catch (error) {
      logger.error('Failed to store chat history:', error);
    }
  }

  async function handleFeedback(messageId, feedbackType, feedbackMessageIndex) {
    updateFeedbackIcons(messageId, feedbackType, feedbackMessageIndex);
    logger.log(`Feedback recorded for message ${messageId}: ${feedbackType}`);
    const rating = feedbackType === 'positive' ? 1 : -1;
    const feedback = await sendFeedbackToBackend(messageId, rating);
    await updateAssistantMessageWithFeedback(messageId, feedback);
  }

  async function sendFeedbackToBackend(messageId, rating) {
    try {
      const result = await headwaiAPI.evaluations.sendFeedback({
        assistantId,
        messageId,
        rating,
        chatId: $chatId,
        messageHistory: $messageHistory,
      });

      if (result) {
        logger.log('Feedback sent successfully:', result);
        return result;
      } else {
        logger.error('Failed to send feedback');
      }
    } catch (error) {
      logger.error('Failed to send feedback:', error);
    }
    return null;
  }

  function updateFeedbackIcons(messageId, feedbackType, feedbackMessageIndex) {
    logger.log(messageId, feedbackType, feedbackMessageIndex);

    let updatedHtml = '';

    if (feedbackType === 'positive') {
      updatedHtml = `
            <div class="feedback">
            <div class="feedback-icons">
                ${createFeedbackIconHtml(
                  'positive',
                  $t('chat.content.feedback.positive'),
                  'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3',
                  messageId,
                  feedbackMessageIndex,
                  true,
                )}
                ${createFeedbackIconHtml(
                  'negative',
                  $t('chat.content.feedback.negative'),
                  'M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17',
                  messageId,
                  feedbackMessageIndex,
                  false,
                )}
            </div>
        </div>
        `;
    } else {
      updatedHtml = `
            <div class="feedback">
            <div class="feedback-icons">
                ${createFeedbackIconHtml(
                  'positive',
                  $t('chat.content.feedback.positive'),
                  'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3',
                  messageId,
                  feedbackMessageIndex,
                  false,
                )}
                ${createFeedbackIconHtml(
                  'negative',
                  $t('chat.content.feedback.negative'),
                  'M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17',
                  messageId,
                  feedbackMessageIndex,
                  true,
                )}
            </div>
        </div>
        `;
    }

    // Update the message in deep-chat
    deepChatRef.updateMessage(
      {
        html: updatedHtml,
        role: DEEP_CHAT_FEEDBACK_ROLE,
      },
      feedbackMessageIndex,
    );

    // Update the HTML in message history for persistence
    $messageHistory.forEach((msg) => {
      if (
        msg.role === DEEP_CHAT_FEEDBACK_ROLE &&
        msg.associatedMessageId === messageId
      ) {
        msg.html = updatedHtml;
        msg.feedbackType = feedbackType; // Store the feedback type for future reference
      }
    });

    // Store the updated message history
    storeFeedbackInHistory();
  }

  async function updateAssistantMessageWithFeedback(messageId, feedback) {
    if (!$chatId || !feedback || !messageId) {
      logger.error(
        'Cannot update assistant message: no chat ID, messageId or feedback available',
      );
      return;
    }

    // Update the message with feedback information
    $messageHistory.forEach((msg) => {
      if (msg.id === messageId && msg.role === HEADWAI_ASSISTANT_ROLE) {
        msg.feedbackId = feedback.id;
        msg.annotation = {
          rating: feedback.data.rating,
        };
      }
    });

    const message = $messageHistory.find((msg) => msg.id === messageId);
    if (!message) {
      logger.error(
        `Message not found in history for feedback ID: ${messageId}`,
      );
      return;
    }

    try {
      // Update assistant message with feedback using the API
      const success = await headwaiAPI.chats.updateAssistantMessageWithFeedback(
        $chatId,
        assistantId,
        $messageHistory,
      );

      if (success) {
        logger.log('Assistant message updated with feedback successfully');
        logMessageHistory($messageHistory);
      } else {
        logger.error('Failed to update assistant message with feedback');
      }
    } catch (error) {
      logger.error('Error updating assistant message with feedback:', error);
    }
  }

  // Expose handleFeedback function to global scope for inline onclick handlers
  if (typeof window !== 'undefined') {
    window.handleFeedback = handleFeedback;
  }

  // Reset chat state when chat is first opened or when starting fresh
  onMount(() => {
    logger.log('ChatContent mounted - checking state', {
      chatId: $chatId,
      messageHistoryLength: $messageHistory.length,
    });

    // If we have existing message history, set it as the initial history for deep-chat
    if ($chatId && $messageHistory.length > 0) {
      deepChatHistory = transformMessagesHeadwaiToDeepChat($messageHistory);
      logger.log('ChatContent mounted with existing history', deepChatHistory);
    } else if (!$chatId) {
      logger.log('ChatContent mounted - initializing fresh state');
      // Reset all stores to ensure clean state
      chatId.set(null);
      messageHistory.set([]);
      currentReferences.set([]);
      currentAssistantMessageContent.set('');
      currentUserMessageContent.set('');
      currentAssistantMessageSources.set([]);
      currentUserMessageId.set(null);
      currentAssistantMessageId.set(null);
      deepChatHistory = initialHistory;

      // Reset title generation tracking
      firstResponseReceived = false;
      generatedChatTitle.set(null);
    }
  });

  // Reactive statement to handle chat state changes
  $: if (!$chatId && $messageHistory.length === 0) {
    // Reset to initial history when starting a new chat
    deepChatHistory = initialHistory;
    logger.log('Reset deep-chat history for new chat');
  } else if ($isChatOpen && $chatId) {
    // If chat is opened and there's already a chat session, keep it
    // This maintains the conversation when user minimizes/maximizes chat
    logger.log('Chat reopened with existing session');
  }
</script>

<style>
  .chat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Ensure deep-chat fills the container properly */
  .chat-content :global(deep-chat) {
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
    display: block !important;
    top: 0 !important;
    left: 0 !important;
    box-sizing: border-box !important;
  }

  /* Force deep-chat's internal container to fill space */
  .chat-content :global(deep-chat > *) {
    width: 100% !important;
    height: 100% !important;
    box-sizing: border-box !important;
  }

  /* Mobile-specific fixes for deep-chat input visibility */
  @media (max-width: 768px) {
    .chat-content {
      /* Ensure the chat content doesn't get hidden behind virtual keyboard */
      position: relative;
      min-height: 0;
      flex: 1 1 auto;
    }

    .chat-content :global(deep-chat) {
      /* Use dynamic viewport units for better mobile keyboard handling */
      max-height: 100% !important;
      /* Prevent the component from being larger than its container */
      overflow: hidden !important;
    }

    /* Target the input area specifically */
    .chat-content :global(deep-chat [class*='input']),
    .chat-content :global(deep-chat [class*='text-input']),
    .chat-content :global(deep-chat input),
    .chat-content :global(deep-chat textarea) {
      /* Ensure input is always visible above keyboard */
      position: relative !important;
      z-index: 1000 !important;
      /* Prevent input from being cut off */
      margin-bottom: env(safe-area-inset-bottom, 0px) !important;
      /* Prevent zoom on focus for Android */
      font-size: 16px !important;
      -webkit-text-size-adjust: 100% !important;
    }

    /* Ensure message container doesn't overlap input */
    .chat-content :global(deep-chat [class*='messages']),
    .chat-content :global(deep-chat [class*='message-container']) {
      /* Leave space for input area */
      padding-bottom: 80px !important;
      /* Ensure scrolling works properly */
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
    }
  }

  /* Android-specific virtual keyboard fixes */
  @media screen and (max-width: 768px) and (max-height: 600px) {
    /* When keyboard is likely visible (reduced viewport height) */
    .chat-content :global(deep-chat) {
      /* Adjust height when keyboard appears */
      height: 100% !important;
      max-height: none !important;
    }
  }
</style>
