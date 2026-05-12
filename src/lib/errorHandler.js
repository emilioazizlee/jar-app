/**
 * Async error handler — wraps any async operation with toast feedback.
 *
 * @example
 * const { success, data } = await handleAsync(
 *   () => base44.entities.Item.create(formData),
 *   { successMessage: 'Item created' }
 * );
 */
import { toast } from 'sonner';
import { logger } from './logger';

/**
 * @param {() => Promise<any>} fn
 * @param {{ successMessage?: string, errorMessage?: string, onSuccess?: (data: any) => void, onError?: (err: Error) => void }} options
 * @returns {Promise<{ success: boolean, data?: any, error?: Error }>}
 */
export async function handleAsync(fn, options = {}) {
  const {
    successMessage = null,
    errorMessage = 'Something went wrong',
    onSuccess = null,
    onError = null,
  } = options;

  try {
    const result = await fn();
    if (successMessage) toast.success(successMessage);
    if (onSuccess) onSuccess(result);
    return { success: true, data: result };
  } catch (error) {
    const message = error?.message || errorMessage;
    toast.error(message);
    logger.error('handleAsync error:', error);
    if (onError) onError(error);
    return { success: false, error };
  }
}