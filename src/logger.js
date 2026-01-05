/**
 * Development-only logger utility
 * Logs only when in development mode, silent in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log('[DEV]', ...args);
    }
  },

  error: (...args) => {
    if (isDev) {
      console.error('[DEV ERROR]', ...args);
    }
  },

  warn: (...args) => {
    if (isDev) {
      console.warn('[DEV WARN]', ...args);
    }
  },

  info: (...args) => {
    if (isDev) {
      console.info('[DEV INFO]', ...args);
    }
  },

  debug: (...args) => {
    if (isDev) {
      console.debug('[DEV DEBUG]', ...args);
    }
  },

  // Group logging for better organization
  group: (label, ...args) => {
    if (isDev) {
      console.group(`[DEV] ${label}`, ...args);
    }
  },

  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },

  // Table logging for structured data
  table: (data) => {
    if (isDev) {
      console.table(data);
    }
  },
};

// You can also export individual functions if you prefer
export const { log, error, warn, info, debug, group, groupEnd, table } = logger;
