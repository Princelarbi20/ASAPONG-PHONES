export const normalizeTransactionReference = (value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const normalizeOrderPayload = (payload = {}) => {
  const shippingAddress = payload.shippingAddress || {};
  const normalizedAddress = {
    address: typeof shippingAddress.address === 'string' ? shippingAddress.address.trim() : '',
    city: typeof shippingAddress.city === 'string' ? shippingAddress.city.trim() : '',
    state: typeof shippingAddress.state === 'string' ? shippingAddress.state.trim() : '',
    country: typeof shippingAddress.country === 'string' ? shippingAddress.country.trim() : '',
    postalCode: typeof shippingAddress.postalCode === 'string' ? shippingAddress.postalCode.trim() : '',
  };

  const paymentMethod = payload.paymentMethod === 'ONLINE' || payload.paymentMethod === 'PAYSTACK'
    ? 'PAYSTACK'
    : 'CASH_ON_DELIVERY';

  return {
    ...payload,
    paymentMethod,
    shippingAddress: normalizedAddress,
    transactionReference: normalizeTransactionReference(payload.transactionReference),
    paymentMetadata: payload.paymentMetadata ?? null,
  };
};
