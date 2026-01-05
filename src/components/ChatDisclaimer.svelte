<div
  class="disclaimer-container"
  role="dialog"
  aria-modal="true"
  aria-labelledby="disclaimer-title"
  bind:this={dialogElement}
>
  <div class="disclaimer-content">
    <div class="disclaimer-header">
      <h3 id="disclaimer-title">{title}</h3>
    </div>
    <div class="disclaimer-body">
      <p>{message}</p>
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
    margin: 0 0 12px 0;
    font-size: var(--font-size, 1em);
    font-family: var(--font-family, inherit);
    line-height: 1.5;
    color: #555;
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
