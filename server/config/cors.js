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

  if (process.env.NODE_ENV === "production") {
    return [...new Set(fromEnv)];
  }

  return [...new Set([...fromEnv, ...DEFAULT_DEV_ORIGINS])];
};

const isLocalDevOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const isTunnelDevOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname.includes("ngrok") ||
      hostname.includes("cloudflare") ||
      hostname.endsWith(".loca.lt") ||
      hostname.endsWith(".pinggy.link") ||
      hostname.endsWith(".app.github.dev") ||
      hostname.endsWith(".gitpod.io")
    );
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, origin);
      return;
    }

    
    if (
      process.env.NODE_ENV !== "production" &&
      (isLocalDevOrigin(origin) || isTunnelDevOrigin(origin))
    ) {
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
