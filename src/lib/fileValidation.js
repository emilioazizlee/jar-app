/*
 * File upload validation utilities.
 * Always validate before passing files to FileReader or uploading.
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES = {
  csv: ['text/csv', 'application/vnd.ms-excel', 'text/plain'],
  json: ['application/json', 'text/plain'],
  txt: ['text/plain'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

/**
 * @param {File} file
 * @param {string[]} allowedFormats - e.g. ['csv', 'json']
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file, allowedFormats = ['csv']) {
  if (!file) return { valid: false, error: 'No file selected' };

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
  }

  const allowedMimeTypes = allowedFormats.flatMap(f => ALLOWED_TYPES[f] || []);
  // Also check by extension as fallback (some browsers report wrong MIME for CSV)
  const ext = file.name.split('.').pop()?.toLowerCase();
  const extOk = allowedFormats.includes(ext);

  if (!allowedMimeTypes.includes(file.type) && !extOk) {
    return { valid: false, error: `Invalid file type. Allowed: ${allowedFormats.join(', ')}` };
  }

  return { valid: true };
}