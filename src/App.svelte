<main>
  <!-- Floating HeadwAI Chat Bubble Icon -->
  {#if !$isChatOpen}
    <ChatIcon
      faviconBackgroundColor={computedBackgroundColor}
      iconPath={computedFaviconPath}
    />
  {/if}

  {#if $isChatOpen}
    <div
      class="chat-container"
      style="--font-size: {computedFontSize}; --font-family: {computedFontFamily}; --chat-header-background: {computedBackgroundColor}; --submit-button-color: {computedBackgroundColor}"
    >
      <!-- Chat Header -->
      <ChatHeader
        iconPath={computedFaviconPath}
        chatTitle={computedChatTitle}
        {initialHistory}
        {deepChatRef}
      />

      <!-- Show disclaimer if not accepted, otherwise show chat content -->
      {#if !$isDisclaimerAccepted}
        <ChatDisclaimer
          title={computedDisclaimerTitle}
          message={computedDisclaimerMessage}
        />
      {:else}
        <!-- Chat Content -->
        <ChatContent
          bind:deepChatRef
          placeholderText={computedPlaceholderText}
          fontFamily={computedFontFamily}
          fontSize={computedFontSize}
          userMessageBackgroundColor={computedUserMessageBackgroundColor}
          userMessageTextColor={computedUserMessageTextColor}
          aiMessageBackgroundColor={computedAiMessageBackgroundColor}
          aiMessageTextColor={computedAiMessageTextColor}
          feedbackMessageBackgroundColor={computedFeedbackMessageBackgroundColor}
          feedbackMessageTextColor={computedFeedbackMessageTextColor}
          {initialHistory}
          apiUrl={computedApiUrl}
          apiKey={computedApiKey}
          assistantId={computedAssistantId}
          maxMessages={computedMaxMessages}
          submitButtonBackgroundColor={computedBackgroundColor}
        />
      {/if}

      <!-- Disclaimer Info Overlay -->
      {#if $isDisclaimerInfoOpen}
        <ChatDisclaimerInfo
          title={computedInfoTitle}
          message={computedInfoMessage}
        />
      {/if}
    </div>
  {/if}
</main>

<!-- This is an example for a Svelte browser app, if you are using SvelteKit, please see the following example:
  https://codesandbox.io/p/sandbox/deep-chat-sveltekit-fn8h6x -->

<script>
  import { DeepChat } from 'deep-chat';
  // Import favicon as an asset to ensure it's bundled
  import defaultFaviconUrl from '../icons/favicon.svg';
  import ChatHeader from './components/ChatHeader.svelte';
  import ChatIcon from './components/ChatIcon.svelte';
  import ChatContent from './components/ChatContent.svelte';
  import ChatDisclaimer from './components/ChatDisclaimer.svelte';
  import ChatDisclaimerInfo from './components/ChatDisclaimerInfo.svelte';
  import {
    isChatOpen,
    generatedChatTitle,
    isDisclaimerAccepted,
    isDisclaimerInfoOpen,
  } from './stores.js';
  import { initI18n } from './i18n.js';
  import { setContext, onMount } from 'svelte';
  import { logger } from './logger.js';
  import { writable } from 'svelte/store';
  import { DEEP_CHAT_ASSISTANT_ROLE } from './constants.js';

  // Accept configuration as props for widget mode
  export let apiUrl = undefined;
  export let apiKey = undefined;
  export let assistantId = undefined;
  export let maxMessages = undefined;
  export let placeholderText = undefined;
  export let faviconPath = undefined;
  export let initialMessage = undefined;
  export let userMessageBackgroundColor = undefined;
  export let aiMessageBackgroundColor = undefined;
  export let userMessageTextColor = undefined;
  export let aiMessageTextColor = undefined;
  export let feedbackMessageBackgroundColor = undefined;
  export let feedbackMessageTextColor = undefined;
  export let faviconBackgroundColor = undefined;
  export let fontFamily = undefined;
  export let fontSize = undefined;
  export let chatTitle = undefined;
  export let locale = undefined;
  export let disclaimerTitle = undefined;
  export let disclaimerMessage = undefined;
  export let infoTitle = undefined;
  export let infoMessage = undefined;

  let deepChatRef; // Reference to the deep-chat component

  // Create translation function store with fallback
  const tStore = writable((key) => key);

  // Set the context immediately during component initialization
  setContext('i18n', tStore);

  // Initialize i18n system
  onMount(() => {
    try {
      const configLocale = locale || undefined;
      const translationFunction = initI18n(configLocale);
      tStore.set(translationFunction);
    } catch (error) {
      logger.error('Failed to initialize i18n:', error);
      // Keep the fallback function already in the store
    }
  });

  // Reactive computed values using the translation store
  $: computedInitialMessage =
    initialMessage ||
    import.meta.env.VITE_CHAT_BUBBLE_INITIAL_MESSAGE ||
    $tStore('chat.content.initialMessage');

  $: computedChatTitle =
    chatTitle ||
    import.meta.env.VITE_CHAT_BUBBLE_CHAT_TITLE ||
    $tStore('chat.header.title');

  $: computedPlaceholderText =
    placeholderText ||
    import.meta.env.VITE_CHAT_BUBBLE_PLACEHOLDER_TEXT ||
    $tStore('chat.content.placeholder');

  const computedFaviconPath =
    faviconPath ||
    import.meta.env.VITE_CHAT_BUBBLE_FAVICON_PATH ||
    defaultFaviconUrl;
  const computedFontFamily =
    fontFamily || import.meta.env.VITE_CHAT_BUBBLE_FONT_FAMILY || 'inherit';
  const computedFontSize =
    fontSize || import.meta.env.VITE_CHAT_BUBBLE_FONT_SIZE || 'inherit';
  const computedBackgroundColor =
    faviconBackgroundColor ||
    import.meta.env.VITE_CHAT_BUBBLE_FAVICON_BG_COLOR ||
    '#667eea';
  const computedAssistantId =
    assistantId ||
    import.meta.env.VITE_CHAT_BUBBLE_ASSISTANT_ID ||
    'test-model';
  const computedApiUrl = (
    apiUrl ||
    import.meta.env.VITE_CHAT_BUBBLE_API_URL ||
    'https://localhost'
  ).replace(/\/$/, '');
  const computedApiKey =
    apiKey || import.meta.env.VITE_CHAT_BUBBLE_API_KEY || undefined;

  const computedUserMessageBackgroundColor =
    userMessageBackgroundColor ||
    import.meta.env.VITE_CHAT_BUBBLE_USER_MESSAGE_BG_COLOR ||
    '#007bff';
  const computedUserMessageTextColor =
    userMessageTextColor ||
    import.meta.env.VITE_CHAT_BUBBLE_USER_MESSAGE_TEXT_COLOR ||
    '#000000';
  const computedAiMessageBackgroundColor =
    aiMessageBackgroundColor ||
    import.meta.env.VITE_CHAT_BUBBLE_AI_MESSAGE_BG_COLOR ||
    '#f1f3f4';
  const computedAiMessageTextColor =
    aiMessageTextColor ||
    import.meta.env.VITE_CHAT_BUBBLE_AI_MESSAGE_TEXT_COLOR ||
    '#000000';
  const computedFeedbackMessageBackgroundColor =
    feedbackMessageBackgroundColor ||
    import.meta.env.VITE_CHAT_BUBBLE_FEEDBACK_MESSAGE_BG_COLOR ||
    '#ffffff';
  const computedFeedbackMessageTextColor =
    feedbackMessageTextColor ||
    import.meta.env.VITE_CHAT_BUBBLE_FEEDBACK_MESSAGE_TEXT_COLOR ||
    '#000000';
  const computedMaxMessages =
    parseInt(maxMessages || import.meta.env.VITE_CHAT_BUBBLE_MAX_MESSAGES) || 0;

  $: computedDisclaimerTitle =
    disclaimerTitle ||
    import.meta.env.VITE_CHAT_BUBBLE_DISCLAIMER_TITLE ||
    $tStore('chat.disclaimer.title');

  $: computedDisclaimerMessage =
    disclaimerMessage ||
    import.meta.env.VITE_CHAT_BUBBLE_DISCLAIMER_MESSAGE ||
    $tStore('chat.disclaimer.message');

  $: computedInfoTitle =
    infoTitle ||
    import.meta.env.VITE_CHAT_BUBBLE_INFO_TITLE ||
    $tStore('chat.info.title');

  $: computedInfoMessage =
    infoMessage ||
    import.meta.env.VITE_CHAT_BUBBLE_INFO_MESSAGE ||
    $tStore('chat.info.message');

  // Create initial history object that both ChatContent and ChatHeader can use
  $: initialHistory = [
    {
      role: DEEP_CHAT_ASSISTANT_ROLE,
      text: computedInitialMessage,
      custom: { timestamp: Math.floor(Date.now() / 1000) },
    },
  ];
</script>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    /* overflow: hidden; Removed for accessibility */
    width: 100%;
    height: 100%;
  }

  main {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
    pointer-events: none; /* Allow clicks to pass through the main container */
  }

  /* Chat Container */
  .chat-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    height: 600px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 999;
    background: white;
    pointer-events: auto; /* Enable interactions only within the chat container */
    animation: slideIn 0.3s ease-out;
    display: flex;
    flex-direction: column;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .chat-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      max-height: 100dvh; /* Use dynamic viewport height for better mobile support */
      height: 100dvh; /* Dynamic viewport height handles virtual keyboard better */
      border-radius: 0;
      /* Support for iPhone notch and bottom safe areas */
      padding-top: env(safe-area-inset-top, 0px);
      padding-bottom: env(safe-area-inset-bottom, 0px);
      padding-left: env(safe-area-inset-left, 0px);
      padding-right: env(safe-area-inset-right, 0px);
      /* Ensure container doesn't get clipped by keyboard */
      box-sizing: border-box;
      /* Prevent zoom on input focus (Android behavior) */
      -webkit-text-size-adjust: 100%;
      /* Ensure proper stacking above keyboard */
      z-index: 9999;
    }
    /* Additional Android-specific fixes for virtual keyboard issues (portrait) */
    @media (orientation: portrait) {
      .chat-container {
        /* Ensure the chat container adapts when virtual keyboard appears */
        min-height: 100dvh;
        max-height: 100dvh;
      }
    }
  }
</style>
