<div
  class="ai-assistant-icon"
  style="background: {faviconBackgroundColor}"
  on:click={toggleChat}
  on:keydown={(e) => e.key === 'Enter' && toggleChat()}
  role="button"
  tabindex="0"
>
  <img src={iconPath} alt="HeadwAI Chat Bubble" />
</div>

<script>
  import { isChatOpen } from '../stores';

  export let faviconBackgroundColor;
  export let iconPath;
  // Function to toggle chat visibility
  function toggleChat() {
    isChatOpen.set(!$isChatOpen);
  }
</script>

<style>
  .ai-assistant-icon {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    pointer-events: auto; /* Ensure the icon is always clickable */
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .ai-assistant-icon:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .ai-assistant-icon:active {
    transform: scale(0.95);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .ai-assistant-icon img {
    width: 65%;
    height: 65%;
    object-fit: contain;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .ai-assistant-icon {
      width: 56px;
      height: 56px;
      /* Better mobile touch handling */
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      /* Prevent text selection on touch */
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      /* Improve touch responsiveness */
      -webkit-touch-callout: none;
    }

    /* Improve hover states for mobile (touch devices) */
    .ai-assistant-icon:hover {
      transform: none; /* Disable hover transform on mobile */
    }

    /* Better active/touch feedback for mobile */
    .ai-assistant-icon:active {
      transform: scale(0.9);
      transition: transform 0.1s ease;
    }
  }

  /* Smaller touch target for very small screens */
  @media (max-width: 480px) {
    .ai-assistant-icon {
      width: 48px;
      height: 48px;
      /* Ensure minimum 44px touch target (iOS guidelines) */
      min-width: 44px;
      min-height: 44px;
    }
  }
</style>
