<div
  class="disclaimer-info-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="disclaimer-info-title"
  on:click={handleOverlayClick}
  on:keydown={handleOverlayKeyDown}
  bind:this={dialogElement}
>
  <div
    class="disclaimer-info-content"
    role="document"
    on:click|stopPropagation
    on:keydown|stopPropagation
  >
    <div class="disclaimer-info-header">
      <h3 id="disclaimer-info-title">{title}</h3>
      <button
        class="close-info-button"
        on:click={closeDisclaimerInfo}
        aria-label="Close information"
        bind:this={closeButtonElement}
      >
        <svg class="close-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path class="svg-path" d="M18 6L6 18M6 6L18 18" />
        </svg>
      </button>
    </div>
    <div class="disclaimer-info-body">
      <p>{message}</p>
    </div>
  </div>
</div>

<script>
  import { onMount, onDestroy } from 'svelte';
  import { isDisclaimerInfoOpen } from '../stores.js';

  export let title = '';
  export let message = '';

  let dialogElement;
  let closeButtonElement;
  let previouslyFocusedElement;

  function closeDisclaimerInfo() {
    isDisclaimerInfoOpen.set(false);
  }

  function handleOverlayClick() {
    closeDisclaimerInfo();
  }

  function handleOverlayKeyDown(event) {
    // Close on Enter or Space key when clicking the overlay
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      closeDisclaimerInfo();
    }
  }

  function handleKeyDown(event) {
    // Close on Escape key
    if (event.key === 'Escape') {
      closeDisclaimerInfo();
    }

    // Focus trap: handle Tab and Shift+Tab
    if (event.key === 'Tab') {
      const focusableElements = dialogElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const focusableArray = Array.from(focusableElements);
      const firstFocusable = focusableArray[0];
      const lastFocusable = focusableArray[focusableArray.length - 1];

      if (event.shiftKey) {
        // Shift+Tab: if on first element, move to last
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab: if on last element, move to first
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }

  onMount(() => {
    // Store the previously focused element to restore focus when dialog closes
    previouslyFocusedElement = document.activeElement;

    // Focus the close button when the dialog opens
    if (closeButtonElement) {
      closeButtonElement.focus();
    }

    // Add keyboard event listener for focus trapping
    document.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    // Restore focus to the previously focused element
    if (previouslyFocusedElement && previouslyFocusedElement.focus) {
      previouslyFocusedElement.focus();
    }

    // Remove keyboard event listener
    document.removeEventListener('keydown', handleKeyDown);
  });
</script>

<style>
  .disclaimer-info-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .disclaimer-info-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 350px;
    max-height: 80%;
    overflow-y: auto;
    position: relative;
    animation: slideInScale 0.3s ease-out;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }

  @keyframes slideInScale {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .disclaimer-info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .disclaimer-info-header h3 {
    margin: 0;
    font-size: calc(var(--font-size, 1em) * 1.3);
    font-family: var(--font-family, inherit);
    font-weight: 600;
    color: #333;
    flex: 1;
    padding-right: 12px;
  }

  .close-info-button {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .close-icon {
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

  .close-info-button:hover {
    background-color: #f5f5f5;
    color: #333;
  }

  .close-info-button:active {
    background-color: #e8e8e8;
    transform: scale(0.95);
  }

  .close-info-button:focus {
    outline: 2px solid var(--submit-button-color, #007bff);
    outline-offset: 2px;
  }

  .disclaimer-info-body {
    color: #555;
  }

  .disclaimer-info-body p {
    margin: 0 0 12px 0;
    font-size: var(--font-size, 1em);
    font-family: var(--font-family, inherit);
    line-height: 1.5;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .disclaimer-info-content {
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 40px);
      margin: 20px;
    }

    .disclaimer-info-header h3 {
      font-size: calc(var(--font-size, 1em) * 1.2);
    }

    .close-info-button {
      padding: 8px;
      min-width: 44px;
      min-height: 44px;
    }
  }
</style>
