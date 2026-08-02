import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, isOtpExpired, getOtpCooldownRemaining } from '../utils/otpHelpers.js';

test('normalizeEmail trims and lowercases the address', () => {
  assert.equal(normalizeEmail(' User@Example.COM '), 'user@example.com');
});

test('isOtpExpired returns true when expiry is in the past', () => {
  const past = new Date(Date.now() - 60_000).toISOString();
  assert.equal(isOtpExpired(past), true);
});

test('isOtpExpired returns false when expiry is still in the future', () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  assert.equal(isOtpExpired(future), false);
});

test('getOtpCooldownRemaining returns zero when no cooldown is active', () => {
  assert.equal(getOtpCooldownRemaining(null), 0);
  assert.equal(getOtpCooldownRemaining({}), 0);
});

test('getOtpCooldownRemaining returns a positive seconds value while cooldown is active', () => {
  const user = { otpCooldownUntil: new Date(Date.now() + 75_000) };
  const remaining = getOtpCooldownRemaining(user);
  assert.ok(remaining >= 1 && remaining <= 75);
});
