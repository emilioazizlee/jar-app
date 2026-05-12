/**
 * Logging utility — replaces bare console.* calls.
 * In production, only errors are logged.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /** General info — dev only */
  info: (...args) => isDev && console.log('[INFO]', ...args),
  /** Warnings — dev only */
  warn: (...args) => isDev && console.warn('[WARN]', ...args),
  /** Errors — always logged */
  error: (...args) => console.error('[ERROR]', ...args),
  /** Debug — dev only */
  debug: (...args) => isDev && console.debug('[DEBUG]', ...args),
};