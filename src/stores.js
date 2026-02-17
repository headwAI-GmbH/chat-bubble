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
  const stored =
    typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
  const initial = stored === 'true';

  const { subscribe, set } = writable(initial);

  return {
    subscribe,
    accept: () => {
      set(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      }
    },
    reset: () => {
      set(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    },
  };
}

export const isDisclaimerAccepted = createDisclaimerStore();

export const isDisclaimerInfoOpen = writable(false);
