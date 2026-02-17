import { writable } from 'svelte/store';

export const currentUserMessageContent = writable('');

export const currentAssistantMessageContent = writable('');

export const currentAssistantMessageId = writable(null);

export const currentUserMessageId = writable(null);

export const currentAssistantMessageSources = writable([]);

export const currentReferences = writable([]);

export const currentChatTags = writable([]);

export const chatId = writable(null);

export const messageHistory = writable([]);

export const generatedChatTitle = writable(null);

export const isChatOpen = writable(false);

// Create a session store for disclaimer acceptance
function createDisclaimerStore() {
  const STORAGE_KEY = 'headwai-chat-disclaimer-accepted';

  // Check sessionStorage for existing value, default to false
  let initial = false;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      initial = stored === 'true';
    }
  } catch (e) {
    // sessionStorage unavailable (privacy mode, blocked storage, etc.)
    // Fall back to in-memory default
    initial = false;
  }

  const { subscribe, set } = writable(initial);

  return {
    subscribe,
    accept: () => {
      set(true);
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem(STORAGE_KEY, 'true');
        }
      } catch (e) {
        // sessionStorage unavailable, continue with in-memory state only
      }
    },
    reset: () => {
      set(false);
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        // sessionStorage unavailable, continue with in-memory state only
      }
    },
  };
}

export const isDisclaimerAccepted = createDisclaimerStore();

export const isDisclaimerInfoOpen = writable(false);
