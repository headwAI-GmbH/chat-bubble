<div class="chat-header">
  <div class="chat-header-content">
    <img src={iconPath} alt="HeadwAI Chat Bubble" class="chat-header-icon" />
    <h3 class="chat-title">
      {chatTitle}
    </h3>
    <div class="chat-header-buttons">
      <button
        class="chat-new-button"
        on:click={startNewChat}
        on:keydown={(e) => e.key === 'Enter' && startNewChat()}
        aria-label={$t('chat.header.newChat')}
        title={$t('chat.header.newChat')}
      >
        <svg
          class="button-icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            class="svg-path"
            d="M11 4H4a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7"
          />
          <path
            class="svg-path"
            d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
          />
        </svg>
      </button>
      <button
        class="chat-download-button"
        on:click={downloadMessageHistory}
        on:keydown={(e) => e.key === 'Enter' && downloadMessageHistory()}
        aria-label={$t('chat.header.downloadHistory')}
        title={$t('chat.header.downloadHistory')}
        disabled={!$chatId || $messageHistory.length === 0}
      >
        <svg
          class="button-icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            class="svg-path"
            d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15"
          />
          <polyline class="svg-path" points="7,10 12,15 17,10" />
          <line class="svg-path" x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
      <button
        class="chat-info-button"
        on:click={showDisclaimerInfo}
        on:keydown={(e) => e.key === 'Enter' && showDisclaimerInfo()}
        aria-label={$t('chat.header.showInfo')}
        title={$t('chat.header.showInfo')}
      >
        <svg
          class="button-icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle class="svg-path" cx="12" cy="12" r="10" />
          <path class="svg-path" d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3" />
          <path class="svg-path" d="M12,17h.01" />
        </svg>
      </button>
      <button
        class="chat-close-button"
        on:click={closeChat}
        on:keydown={(e) => e.key === 'Enter' && closeChat()}
        aria-label={$t('chat.header.closeChat')}
        title={$t('chat.header.closeChat')}
      >
        <svg
          class="button-icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path class="svg-path" d="M18 6L6 18M6 6L18 18" />
        </svg>
      </button>
    </div>
  </div>
</div>

<script>
  import { getContext } from 'svelte';
  import {
    chatId,
    messageHistory,
    currentReferences,
    currentAssistantMessageContent,
    currentUserMessageContent,
    currentAssistantMessageSources,
    isChatOpen,
    generatedChatTitle,
    isDisclaimerInfoOpen,
  } from '../stores.js';
  import { logger } from '../logger.js';
  import { DEEP_CHAT_FEEDBACK_ROLE } from '../constants.js';

  export let iconPath;
  export let chatTitle;
  export let initialHistory;
  export let deepChatRef;

  // Get translation function store from context
  const t = getContext('i18n');

  function closeChat() {
    isChatOpen.set(false);
  }

  function showDisclaimerInfo() {
    isDisclaimerInfoOpen.set(true);
  }

  function startNewChat() {
    // Reset chat session
    chatId.set(null);
    messageHistory.set([]);
    currentReferences.set([]);
    currentAssistantMessageContent.set('');
    currentUserMessageContent.set('');
    currentAssistantMessageSources.set([]);
    generatedChatTitle.set(null);

    // Clear the chat interface
    if (deepChatRef) {
      deepChatRef.clearMessages();
      // Add the initial message back
      deepChatRef.addMessage(initialHistory[0], false);
    }
  }

  function downloadMessageHistory() {
    if (!$chatId || deepChatRef.getMessages().length === 0) {
      logger.warn('No chat history to download');
      return;
    }
    let content = `Chat ID: ${$chatId}\n\n`;

    deepChatRef.getMessages().forEach((message) => {
      logger.log('Processing message for download:', message);
      if (message.role !== DEEP_CHAT_FEEDBACK_ROLE) {
        const role = message.role.toUpperCase();
        logger.log(`Adding ${role} message to download content`);

        if (message.custom && message.custom.timestamp) {
          const timestamp = new Date(
            message.custom.timestamp * 1000,
          ).toLocaleString();
          content += `[${timestamp}]\n\n[${role}]:\n${message.text}\n\n`;
          logger.log(`Message timestamp: ${timestamp}, content: ${content}`);
        } else {
          content += `[${role}]:\n${message.text}\n\n`;
          logger.log(`Message content: ${content}`);
        }
      }
    });

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${$chatId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logger.log('Message history downloaded');
  }
</script>

<style>
  /* Chat Header */
  .chat-header {
    background: var(--chat-header-background, #667eea);
    color: white;
    padding: 16px 20px;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  .chat-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 2em; /* Scale with the title font size */
  }

  .chat-header-icon {
    height: 100%; /* Scale to fill the available height */
    max-height: 3em; /* Scale with the title font size */
    width: auto; /* Maintain aspect ratio */
    object-fit: contain;
    flex-shrink: 0;
  }

  .chat-title {
    margin: 0;
    font-weight: 600;
    text-align: center;
    font-family: var(--font-family, inherit);
    font-size: calc(var(--font-size, 1em) * 1.2);
    flex: 1;
    line-height: 1.2; /* Tighter line height for consistent spacing */
    padding: 0.5rem 0; /* Add vertical padding to create header height */
  }

  .chat-header-buttons {
    display: flex;
    gap: 4px;
    align-items: center;
    flex-shrink: 0;
  }

  .button-icon {
    width: 1.5em;
    height: 1.5em;
    fill: none;
  }

  .svg-path {
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .chat-new-button,
  .chat-download-button,
  .chat-info-button,
  .chat-close-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    height: 100%;
    max-height: 3.5em;
    width: auto;
    aspect-ratio: 1;
    min-height: 3em;
    min-width: 3em;
  }

  .chat-new-button:hover,
  .chat-download-button:hover,
  .chat-info-button:hover,
  .chat-close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  .chat-new-button:active,
  .chat-download-button:active,
  .chat-info-button:active,
  .chat-close-button:active {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(0.95);
  }

  .chat-new-button:focus,
  .chat-download-button:focus,
  .chat-info-button:focus,
  .chat-close-button:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }

  .chat-download-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chat-download-button:disabled:hover {
    background-color: transparent;
    transform: none;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .chat-header {
      border-radius: 0;
      /* Account for safe area on mobile */
      padding-top: calc(16px + env(safe-area-inset-top, 0px));
      padding-left: calc(20px + env(safe-area-inset-left, 0px));
      padding-right: calc(20px + env(safe-area-inset-right, 0px));
      /* Ensure header stays above keyboard */
      position: relative;
      z-index: 1000;
    }

    .chat-header-buttons {
      gap: 2px; /* Larger gaps for easier touch targets */
    }

    .chat-new-button,
    .chat-download-button,
    .chat-info-button,
    .chat-close-button {
      width: 3.5em;
      height: 3.5em;
      padding: 2px;
      /* Better mobile touch handling */
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      /* Ensure minimum 44px touch target (iOS guidelines) */
      min-width: 3.75em;
      min-height: 3.75em;
    }

    /* Disable hover effects on mobile touch devices */
    .chat-new-button:hover,
    .chat-download-button:hover,
    .chat-info-button:hover,
    .chat-close-button:hover {
      background-color: transparent;
      transform: none;
    }

    /* Better touch feedback */
    .chat-new-button:active,
    .chat-download-button:active,
    .chat-info-button:active,
    .chat-close-button:active {
      background-color: rgba(255, 255, 255, 0.2);
      transform: scale(0.9);
      transition: all 0.1s ease;
    }

    .chat-title {
      /* Slightly larger text on mobile - scale with configured font size */
      font-size: 1.125em; /* 18px equivalent when base is 16px, but scales with configured fontSize */
      /* Prevent text selection on touch */
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }

  /* Android-specific improvements */
  @media screen and (max-width: 768px) {
    .chat-header-buttons button {
      /* Prevent callout on touch */
      -webkit-touch-callout: none;
      /* Improve button responsiveness on Android */
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }
</style>
