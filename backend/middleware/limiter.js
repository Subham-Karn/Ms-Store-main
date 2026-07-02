import { RateLimiter } from "limiter";

const limiters = new Map();

const getLimiter = (ip) => {
  if (!limiters.has(ip)) {
    limiters.set(
      ip,
      new RateLimiter({
        tokensPerInterval: 20,
        interval: "minute",
        fireImmediately: false,
      })
    );
  }
  return limiters.get(ip);
};

export const rateLimiterMiddleware = async (req, res, next) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "global";
  const limiter = getLimiter(ip);

  try {
    const remainingTokens = await limiter.removeTokens(1);

    if (remainingTokens < 0) {
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message: "Too many requests. Please try again after a minute.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};