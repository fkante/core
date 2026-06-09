import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    globalSetup: ['./src/test/global-setup.ts'],
    setupFiles: ['./src/test/env-setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
})
