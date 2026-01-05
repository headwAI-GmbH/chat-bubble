/**
 * Internationalization utility for chat bubble widget
 * Supports locale detection and translation functions
 */

import { logger } from './logger.js';
import enMessages from './translations/en.js';
import deMessages from './translations/de.js';

// Default locale
const DEFAULT_LOCALE = 'en-GB';

// Supported locales - add more as needed
const SUPPORTED_LOCALES = ['en-GB', 'de-DE', 'de-AT'];

/**
 * Detect user's locale from various sources
 * Priority: 1. Config override 2. Navigator language 3. Default
 */
export function detectLocale(configLocale = null) {
  // If explicitly configured, use that
  if (configLocale && SUPPORTED_LOCALES.includes(configLocale)) {
    logger.log(`Using configured locale: ${configLocale}`);
    return configLocale;
  }

  // Try to detect from browser
  if (typeof navigator !== 'undefined') {
    // Check navigator.language first (most specific)
    let browserLocale = navigator.language;

    if (SUPPORTED_LOCALES.includes(browserLocale)) {
      logger.log(`Detected browser locale: ${browserLocale}`);
      return browserLocale;
    }

    // Check navigator.languages array
    if (navigator.languages) {
      for (const lang of navigator.languages) {
        if (SUPPORTED_LOCALES.includes(lang)) {
          logger.log(`Detected browser locale from languages array: ${lang}`);
          return lang;
        }
      }
    }

    // Try to match by language code (e.g., 'de' -> 'de-DE')
    const languageCode = browserLocale.split('-')[0];
    if (languageCode === 'de') {
      logger.log(`Detected German language, using de-DE as default`);
      return 'de-DE';
    }
    if (languageCode === 'en') {
      logger.log(`Detected English language, using en-GB as default`);
      return 'en-GB';
    }
  }

  logger.log(`Using default locale: ${DEFAULT_LOCALE}`);
  return DEFAULT_LOCALE;
}

/**
 * Load translation messages for a specific locale
 * Uses static imports - translations are bundled directly in the main file
 */
export function loadMessages(locale) {
  // Normalize locale for message selection
  const normalizedLocale = locale.startsWith('de') ? 'de' : 'en';

  let messages;

  switch (normalizedLocale) {
    case 'de':
      messages = deMessages;
      break;
    case 'en':
    default:
      messages = enMessages;
      break;
  }

  logger.log(
    `Loaded messages for locale: ${locale} (normalized: ${normalizedLocale})`,
  );
  return messages;
}
/**
 * Create translation function for a specific locale and messages
 */
export function createTranslationFunction(messages, locale) {
  /**
   * Translate a key with optional parameters
   * @param {string} key - Translation key (e.g., 'chat.header.title')
   * @param {Object} params - Optional parameters for interpolation
   */
  function t(key, params = {}) {
    // Navigate through nested object using dot notation
    const keys = key.split('.');
    let value = messages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found, return the key itself as fallback
        logger.warn(`Translation key not found: ${key} for locale ${locale}`);
        return key;
      }
    }

    // If final value is not a string, return the key
    if (typeof value !== 'string') {
      logger.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // Replace parameters in the string
    let translatedText = value;
    Object.keys(params).forEach((param) => {
      const placeholder = `{${param}}`;
      translatedText = translatedText.replace(
        new RegExp(placeholder, 'g'),
        params[param],
      );
    });

    return translatedText;
  }

  // Add locale information to the function
  t.locale = locale;

  return t;
}

/**
 * Initialize i18n system
 * @param {string} configLocale - Optional locale override from configuration
 * @returns {Function} Translation function
 */
export function initI18n(configLocale = null) {
  const locale = detectLocale(configLocale);
  const messages = loadMessages(locale);
  const t = createTranslationFunction(messages, locale);

  logger.log(`I18n initialized with locale: ${locale}`);

  return t;
}

/**
 * Format date according to locale
 * @param {Date|number} date - Date to format
 * @param {string} locale - Locale code
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale) {
  try {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale);
  } catch (error) {
    logger.error('Error formatting date:', error);
    return new Date(date).toLocaleDateString();
  }
}

/**
 * Format time according to locale
 * @param {Date|number} date - Date to format
 * @param {string} locale - Locale code
 * @returns {string} Formatted time string
 */
export function formatTime(date, locale) {
  try {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    logger.error('Error formatting time:', error);
    return new Date(date).toLocaleTimeString();
  }
}
