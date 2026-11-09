import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createPayFastSignature, isAllowedPayFastIp } from './payfastController.js';

describe('PayFast helpers', () => {
  it('creates a signature using PayFast form encoding and a passphrase', () => {
    const fields = { item_name: 'A room & stay', amount: '12.50' };
    assert.equal(
      createPayFastSignature(fields, 'test phrase'),
      'b2a4f5f79a899a8b39b95d3f40ea0b23'
    );
    assert.equal(
      createPayFastSignature({ ...fields, signature: 'ignored' }, 'test phrase'),
      'b2a4f5f79a899a8b39b95d3f40ea0b23'
    );
  });

  it('matches exact and CIDR IPv4 PayFast source ranges', () => {
    assert.equal(isAllowedPayFastIp('197.97.145.144', ['197.97.145.144']), true);
    assert.equal(isAllowedPayFastIp('197.97.145.145', ['197.97.145.144/31']), true);
    assert.equal(isAllowedPayFastIp('197.97.145.146', ['197.97.145.144/31']), false);
    assert.equal(isAllowedPayFastIp('2001:db8::1', ['197.97.145.144/32']), false);
  });
});
