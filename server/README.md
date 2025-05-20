# Kreator Server README

## Known Issues

### Drizzle ORM Version Conflict

If you encounter the following error when running database migrations:

```
No config path provided, using default 'drizzle.config.ts'
Reading config file '/Users/francis/Documents/Kovalee/tech-monorepo/typescript/packages/kreator-server/drizzle.config.ts'
Please install latest version of drizzle-orm
```

**Solution:**

1.  Navigate to the /typescript of the monorepo.
2.  Run the following command:
    ```bash
    npm install --force drizzle-kit drizzle-orm
    ```
3.  Manually remove the `drizzle-kit` and `drizzle-orm` entries from the root `package.json`.
4.  Rerun the database generation command in the kreator-server:
    ```bash
    npm run db:generate
    ```
