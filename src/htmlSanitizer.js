/**
 * HTML sanitization utility for the chat bubble widget
 *
 * This module provides functions to sanitize user-configurable HTML content
 * to prevent XSS attacks while allowing safe formatting tags.
 *
 * Uses DOMPurify library for robust, battle-tested HTML sanitization.
 */

import DOMPurify from 'dompurify';

/**
 * Configuration for message content sanitization
 * Allows structural HTML tags and safe formatting
 */
const MESSAGE_CONFIG = {
  ALLOWED_TAGS: [
    'strong',
    'b',
    'em',
    'i',
    'u',
    'code',
    'span',
    'br',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: {
    a: { rel: 'noopener noreferrer' }, // Security: prevent window.opener access
  },
};

/**
 * Configuration for title sanitization
 * More restrictive - only basic formatting
 */
const TITLE_CONFIG = {
  ALLOWED_TAGS: ['strong', 'b', 'em', 'i', 'code', 'span'],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
};

/**
 * Sanitizes HTML content for message display
 * Allows structural HTML while preventing XSS attacks
 *
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - The sanitized HTML string
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string' || html.trim() === '') {
    return '';
  }

  return DOMPurify.sanitize(html, MESSAGE_CONFIG);
}

/**
 * Sanitizes HTML content for title display
 * More restrictive - only allows basic text formatting
 *
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - The sanitized HTML string
 */
export function sanitizeTitle(html) {
  if (typeof html !== 'string' || html.trim() === '') {
    return '';
  }

  return DOMPurify.sanitize(html, TITLE_CONFIG);
}
