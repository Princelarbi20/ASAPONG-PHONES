export const normalizeCurrency = (currency) => (currency || '').toUpperCase();

export const normalizeAmount = (amount) => Number(amount || 0);

export const isPaystackSuccessfulStatus = (status) => typeof status === 'string' && status.toLowerCase() === 'success';

export const isValidReference = (reference) => typeof reference === 'string' && reference.trim().length >= 4;

export const isAmountMatch = (expectedAmount, actualAmount) => normalizeAmount(expectedAmount) === normalizeAmount(actualAmount);
