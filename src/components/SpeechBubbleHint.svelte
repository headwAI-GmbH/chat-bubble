<div
  class="speech-bubble"
  class:visible={isVisible}
  style="--font-size: {fontSize}; --font-family: {fontFamily}; --bg-color: {backgroundColor}; --text-color: {textColor};"
>
  <div class="speech-content">{@html message}</div>
  <div class="speech-tail"></div>
</div>

<script>
  import { onMount } from 'svelte';

  export let message = 'Click here if you need help!';
  export let displayDuration = 4000; // 4 seconds
  export let fontSize = 'inherit';
  export let fontFamily = 'inherit';
  export let backgroundColor = '#ffffff';
  export let textColor = '#333333';

  let isVisible = false;
  const SESSION_KEY = 'headwai-chat-bubble-hint-shown';

  onMount(() => {
    // Check if the hint has already been shown in this session
    const hasBeenShown = sessionStorage.getItem(SESSION_KEY) === 'true';

    if (hasBeenShown) {
      // Don't show the hint if it was already shown in this session
      return;
    }

    // Show the speech bubble after a brief delay
    const showTimeout = setTimeout(() => {
      isVisible = true;
      // Mark as shown in this session
      sessionStorage.setItem(SESSION_KEY, 'true');
    }, 500);

    // Hide the speech bubble after the display duration
    const hideTimeout = setTimeout(() => {
      isVisible = false;
    }, displayDuration + 500);

    // Cleanup timeouts on component destroy
    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  });
</script>

<style>
  .speech-bubble {
    position: absolute;
    top: 50%;
    right: calc(100% + 20px); /* Position to the left of the icon */
    transform: translateY(-50%);
    background: var(--bg-color, #ffffff);
    border-radius: 12px;
    padding: 12px 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    min-width: 180px;
    max-width: 280px;
    width: max-content;
    z-index: 1000;
    opacity: 0;
    transform: translateY(-50%) translateX(10px);
    transition: all 0.3s ease-out;
    pointer-events: none;
  }

  .speech-bubble.visible {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }

  .speech-content {
    font-size: var(--font-size, 14px);
    font-family: var(--font-family, inherit);
    color: var(--text-color, #333);
    line-height: 1.4;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .speech-content :global(p) {
    margin: 0 0 0.5em 0;
  }

  .speech-content :global(p:last-child) {
    margin-bottom: 0;
  }

  .speech-content :global(strong) {
    font-weight: 600;
  }

  .speech-content :global(em) {
    font-style: italic;
  }

  .speech-content :global(a) {
    color: #007bff;
    text-decoration: none;
  }

  .speech-content :global(a:hover) {
    text-decoration: underline;
  }

  .speech-tail {
    position: absolute;
    top: 50%;
    right: -6px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid var(--bg-color, #ffffff);
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .speech-bubble {
      right: calc(100% + 15px);
      min-width: 140px;
      max-width: 220px;
      padding: 10px 12px;
    }

    .speech-content {
      font-size: calc(var(--font-size, 13px) * 0.9);
    }
  }

  /* Very small screens */
  @media (max-width: 480px) {
    .speech-bubble {
      min-width: 120px;
      max-width: 180px;
    }
  }

  /* Hide only on extremely small screens */
  @media (max-width: 360px) {
    .speech-bubble {
      display: none;
    }
  }
</style>
