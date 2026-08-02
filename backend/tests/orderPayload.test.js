import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOrderPayload, normalizeTransactionReference } from '../utils/orderPayload.js';

test('returns undefined for missing or blank transaction references', () => {
  assert.equal(normalizeTransactionReference(null), undefined);
  assert.equal(normalizeTransactionReference(''), undefined);
  assert.equal(normalizeTransactionReference('   '), undefined);
});

test('preserves valid transaction references', () => {
  assert.equal(normalizeTransactionReference('paystack_ref_123'), 'paystack_ref_123');
});

test('maps checkout payment methods to backend-safe values', () => {
  const payload = normalizeOrderPayload({
    shippingAddress: {
      address: ' 123 Main St ',
      city: 'Accra',
      state: 'Greater Accra',
      country: 'Ghana',
      postalCode: '00233',
    },
    paymentMethod: 'ONLINE',
    transactionReference: '   ',
    paymentMetadata: { source: 'checkout' },
  });

  assert.equal(payload.paymentMethod, 'PAYSTACK');
  assert.equal(payload.shippingAddress.address, '123 Main St');
  assert.equal(payload.transactionReference, undefined);
  assert.deepEqual(payload.paymentMetadata, { source: 'checkout' });
});
