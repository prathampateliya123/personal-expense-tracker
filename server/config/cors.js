/**
 * config/cors.js
 * CORS settings for cookie-based JWT auth (credentials: true).
 */

const DEFAULT_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const getAllowedOrigins = () => {
  const fromEnv =
    process.env.CLIENT_URL?.split(",").map((url) => url.trim()).filter(Boolean) ||
    [];

  return [...new Set([...fromEnv, ...DEFAULT_DEV_ORIGINS])];
};

const isLocalDevOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    // Postman / server-side requests
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, origin);
      return;
    }

    // Dev fallback: allow any local frontend port
    if (process.env.NODE_ENV !== "production" && isLocalDevOrigin(origin)) {
      callback(null, origin);
      return;
    }

    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

export default corsOptions;
