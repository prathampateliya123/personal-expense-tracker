const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid id";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .filter(Boolean)
      .join(", ") || "Validation failed";
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${req.method} ${req.originalUrl}]`, err.message);
  } else if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err.message);
    message = "Internal Server Error";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
