// Widget entry point for Options 1 & 2 (standalone application)
import App from './App.svelte';

// Runtime configuration override from global variables
function getConfig() {
  const envConfig = {
    apiUrl: import.meta.env.VITE_CHAT_BUBBLE_API_URL,
    apiKey: import.meta.env.VITE_CHAT_BUBBLE_API_KEY,
    assistantId: import.meta.env.VITE_CHAT_BUBBLE_ASSISTANT_ID,
    maxMessages: import.meta.env.VITE_CHAT_BUBBLE_MAX_MESSAGES,
    placeholderText: import.meta.env.VITE_CHAT_BUBBLE_PLACEHOLDER_TEXT,
    userMessageBackgroundColor: import.meta.env
      .VITE_CHAT_BUBBLE_USER_MESSAGE_BG_COLOR,
    aiMessageBackgroundColor: import.meta.env
      .VITE_CHAT_BUBBLE_AI_MESSAGE_BG_COLOR,
    userMessageTextColor: import.meta.env
      .VITE_CHAT_BUBBLE_USER_MESSAGE_TEXT_COLOR,
    aiMessageTextColor: import.meta.env.VITE_CHAT_BUBBLE_AI_MESSAGE_TEXT_COLOR,
    faviconBackgroundColor: import.meta.env.VITE_CHAT_BUBBLE_FAVICON_BG_COLOR,
    chatTitle: import.meta.env.VITE_CHAT_BUBBLE_TITLE,
    locale: import.meta.env.VITE_CHAT_BUBBLE_LOCALE,
    disclaimerTitle: import.meta.env.VITE_CHAT_BUBBLE_DISCLAIMER_TITLE,
    disclaimerMessage: import.meta.env.VITE_CHAT_BUBBLE_DISCLAIMER_MESSAGE,
    infoTitle: import.meta.env.VITE_CHAT_BUBBLE_INFO_TITLE,
    infoMessage: import.meta.env.VITE_CHAT_BUBBLE_INFO_MESSAGE,
  };

  // Allow runtime override via global variables
  const globalConfig =
    (typeof window !== 'undefined' && window.HEADWAI_CHAT_BUBBLE_CONFIG) || {};
  const finalConfig = { ...envConfig, ...globalConfig };

  return finalConfig;
}

// Helper function to merge data attributes with config
function mergeDataAttributes(config, container) {
  const containerConfig = { ...config };

  // Map data attributes to config properties
  const dataAttributeMap = {
    chatBubbleApiUrl: 'apiUrl',
    chatBubbleApiKey: 'apiKey',
    chatBubbleAssistantId: 'assistantId',
    chatBubbleMaxMessages: 'maxMessages',
    chatBubblePlaceholderText: 'placeholderText',
    chatBubbleFaviconPath: 'faviconPath',
    chatBubbleInitialMessage: 'initialMessage',
    chatBubbleUserMessageBackgroundColor: 'userMessageBackgroundColor',
    chatBubbleAiMessageBackgroundColor: 'aiMessageBackgroundColor',
    chatBubbleUserMessageTextColor: 'userMessageTextColor',
    chatBubbleAiMessageTextColor: 'aiMessageTextColor',
    chatBubbleFaviconBackgroundColor: 'faviconBackgroundColor',
    chatBubbleChatTitle: 'chatTitle',
    chatBubbleLocale: 'locale',
    chatBubbleFeedbackMessageBackgroundColor: 'feedbackMessageBackgroundColor',
    chatBubbleFeedbackMessageTextColor: 'feedbackMessageTextColor',
    chatBubbleFontFamily: 'fontFamily',
    chatBubbleFontSize: 'fontSize',
    chatBubbleDisclaimerTitle: 'disclaimerTitle',
    chatBubbleDisclaimerMessage: 'disclaimerMessage',
    chatBubbleInfoTitle: 'infoTitle',
    chatBubbleInfoMessage: 'infoMessage',
  };

  Object.keys(container.dataset).forEach((key) => {
    if (dataAttributeMap[key]) {
      containerConfig[dataAttributeMap[key]] = container.dataset[key];
    }
  });

  return containerConfig;
}

// Helper function to initialize chat bubbles in containers
function initializeChatBubbles(config, shouldClearContainers = false) {
  // Look for containers with data-chat-bubble attribute
  const containers = document.querySelectorAll('[data-chat-bubble]');

  if (containers.length === 0) {
    // If no specific containers, look for #chat-bubble-container
    const defaultContainer = document.getElementById('chat-bubble-container');
    if (defaultContainer) {
      if (shouldClearContainers) {
        defaultContainer.innerHTML = '';
      }
      return new App({
        target: defaultContainer,
        props: config,
      });
    }
  } else {
    // Initialize in all marked containers
    const instances = [];
    containers.forEach((container) => {
      if (shouldClearContainers) {
        container.innerHTML = '';
      }

      const containerConfig = mergeDataAttributes(config, container);

      const instance = new App({
        target: container,
        props: containerConfig,
      });

      instances.push(instance);
    });

    return instances;
  }
}

// Auto-initialize chat bubbles when loaded as a script
if (typeof window !== 'undefined' && window.document) {
  document.addEventListener('DOMContentLoaded', () => {
    const config = getConfig();
    initializeChatBubbles(config);
  });
}

// Also export for manual initialization
window.ChatBubble = {
  init: (target, config = {}) => {
    return new App({
      target,
      props: { ...getConfig(), ...config },
    });
  },

  // Method to reload all chat bubbles with new configuration
  reload: () => {
    const config = getConfig();
    return initializeChatBubbles(config, true);
  },

  // Get current configuration
  getConfig: getConfig,
};
