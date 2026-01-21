<div
  class="disclaimer-container"
  role="dialog"
  aria-modal="true"
  aria-labelledby="disclaimer-title"
  bind:this={dialogElement}
>
  <div class="disclaimer-content">
    <div class="disclaimer-header">
      <h3 id="disclaimer-title">{@html title}</h3>
    </div>
    <div class="disclaimer-body">
      <div class="message-content">{@html message}</div>
    </div>
    <div class="disclaimer-actions">
      <button
        class="decline-button"
        aria-label="Decline terms"
        on:click={handleDecline}
        bind:this={declineButton}
      >
        {$tStore('chat.disclaimer.decline')}
      </button>
      <button
        class="accept-button"
        aria-label="Accept terms"
        on:click={handleAccept}
      >
        {$tStore('chat.disclaimer.accept')}
      </button>
    </div>
  </div>
</div>

<script>
  import { getContext, onMount, onDestroy } from 'svelte';
  import { isDisclaimerAccepted, isChatOpen } from '../stores.js';

  export let title = '';
  export let message = '';

  const tStore = getContext('i18n');

  let dialogElement;
  let declineButton;

  // Focus trapping: handle Tab key to keep focus within the dialog
  function handleKeydown(event) {
    if (event.key === 'Tab' && dialogElement) {
      const focusableElements = dialogElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  onMount(() => {
    // Set focus to the first button when the dialog opens
    if (declineButton) {
      declineButton.focus();
    }
    // Add event listener for focus trapping
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    // Clean up event listener
    window.removeEventListener('keydown', handleKeydown);
  });

  function handleAccept() {
    isDisclaimerAccepted.accept();
  }

  function handleDecline() {
    isChatOpen.set(false);
  }
</script>

<style>
  .disclaimer-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .disclaimer-content {
    padding: 24px;
    max-width: 350px;
    text-align: left;
  }

  .disclaimer-header h3 {
    margin: 0 0 16px 0;
    font-size: calc(var(--font-size, 1em) * 1.3);
    font-family: var(--font-family, inherit);
    font-weight: 600;
    color: #333;
    text-align: center;
  }

  .disclaimer-body {
    margin-bottom: 24px;
  }

  .disclaimer-body p {
    margin: 0 0 0.75em 0;
    font-size: var(--font-size, 1em);
    font-family: var(--font-family, inherit);
    line-height: 1.5;
    color: #555;
  }

  .message-content {
    font-size: var(--font-size, 1em);
    font-family: var(--font-family, inherit);
    line-height: 1.5;
    color: #555;
  }

  .message-content p {
    margin: 0 0 0.75em 0;
  }

  .message-content p:last-child {
    margin-bottom: 0;
  }

  .message-content h1,
  .message-content h2,
  .message-content h3,
  .message-content h4,
  .message-content h5,
  .message-content h6 {
    margin: 1em 0 0.5em 0;
    font-weight: 600;
    font-family: var(--font-family, inherit);
    color: #333;
  }

  .message-content h1:first-child,
  .message-content h2:first-child,
  .message-content h3:first-child,
  .message-content h4:first-child,
  .message-content h5:first-child,
  .message-content h6:first-child {
    margin-top: 0;
  }

  .message-content h1 {
    font-size: 1.5em;
  }
  .message-content h2 {
    font-size: 1.3em;
  }
  .message-content h3 {
    font-size: 1.2em;
  }
  .message-content h4 {
    font-size: 1.1em;
  }
  .message-content h5 {
    font-size: 1em;
  }
  .message-content h6 {
    font-size: 1em;
  }

  .message-content ul,
  .message-content ol {
    margin: 0.5em 0;
    padding-left: 1.25em;
  }

  .message-content li {
    margin: 0.25em 0;
  }

  .message-content a {
    color: var(--submit-button-color, #007bff);
    text-decoration: underline;
  }

  .message-content a:hover {
    text-decoration: none;
  }

  .message-content strong {
    font-weight: 600;
  }

  .message-content em {
    font-style: italic;
  }

  .message-content code {
    background-color: #f5f5f5;
    padding: 0.125em 0.25em;
    border-radius: 0.25em;
    font-family: monospace;
    font-size: 0.9em;
  }

  .message-content pre {
    background-color: #f5f5f5;
    padding: 0.75em;
    border-radius: 0.25em;
    overflow-x: auto;
    margin: 0.75em 0;
  }

  .message-content pre code {
    background: none;
    padding: 0;
  }

  .message-content blockquote {
    margin: 0.75em 0;
    padding: 0.5em 1em;
    border-left: 0.25em solid var(--submit-button-color, #007bff);
    background-color: #f9f9f9;
    font-style: italic;
  }

  .disclaimer-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .decline-button,
  .accept-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: calc(var(--font-size, 1em) * 1.1);
    font-family: var(--font-family, inherit);
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    min-width: 80px;
  }

  .decline-button {
    background: #f5f5f5;
    color: #666;
  }

  .decline-button:hover {
    background: #e8e8e8;
  }

  .accept-button {
    background: var(--submit-button-color, #007bff);
    color: white;
  }

  .accept-button:hover {
    opacity: 0.8;
  }

  .accept-button:focus,
  .decline-button:focus {
    outline: 2px solid var(--submit-button-color, #007bff);
    outline-offset: 2px;
  }
</style>
