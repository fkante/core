import { describe, it } from 'node:test';

import assert from 'node:assert';
import { kwartzClient } from "../src/integrations/kwartz/kwartz.client";

describe('KeyMessages', () => {
  it('should fetch key messages', async () => {
    try {
      const keyMessages = await kwartzClient.fetchKeyMessages('BEN-IOS');
      assert.ok(keyMessages.length > 0, 'Should have at least one key message');
    } catch (error) {
      console.error('Error fetching key messages:', error);
      assert.fail('Should not throw an error');
    }
  });
  it('should throw an error if app code is not valid', async () => {
    try {
      // ben is not a valid app code it should be BEN-IOS
      await kwartzClient.fetchKeyMessages('ben');
    } catch (error) {
      console.error('Error validating app code:', error);
      assert.ok(error.message.includes('appCode must be in the format'), 'Should include "appCode must be in the format" in the error message');
    }
  });
});