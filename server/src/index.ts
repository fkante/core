import app, { ALLOWED_ORIGINS } from "./app";
import { env } from "./env";

const PORT = env.PORT || 5001;

app.listen(PORT, () => console.log(`\n- Listening on port ${PORT}.`));

console.log(`Server configuration:`);
console.log(`- Server running on port: ${PORT}`);
console.log(`- Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
console.log(`- Environment: ${env.NODE_ENV}`);

// Log route information
app.use((req, res, next) => {
  const routePath = req.originalUrl || req.url;
  const method = req.method;
  console.log(
    `[${new Date().toISOString()}] Route called: ${routePath} - Method: ${method}`
  );
  next();
});
