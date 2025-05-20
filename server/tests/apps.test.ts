import { describe, it } from 'node:test';

import { appsClient } from '../src/integrations/apps/apps.client';
import assert from 'node:assert';

describe('AppsClient - fetchApps', () => {
  it('should fetch at least one app', async () => {
    try {
      assert.ok(appsClient, 'appsClient should be defined');
      const apps = await appsClient.fetchSignedApps();
      assert.ok(apps.length > 0, 'Should have at least one app');
    } catch (error) {
      console.error('Error fetching apps:', error);
      assert.fail('Should not throw an error');
    }
  });

  it('should fetch app by code', async () => {
    try {
      const app = await appsClient.fetchAppByCode('BEN-IOS');
      assert.ok(app, 'Should have an app');
      assert.equal(app.code, 'ben', 'Should have the correct app code');
    } catch (error) {
      console.error('Error fetching app by code:', error);
      assert.fail('Should not throw an error');
    }
  });

  it('should throw an error if app code is not valid', async () => {
    try {
      // ben is not a valid app code it should be BEN-IOS
      await appsClient.fetchAppByCode('ben');
    } catch (error) {
      console.error('Error fetching app by code:', error);
      assert.ok(error instanceof Error, 'Should throw an error');
    }
  });
});
