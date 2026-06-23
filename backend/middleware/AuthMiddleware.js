import { ApiError } from "../util/ApiError.js";
import { auth, db } from "../db/firebaseAdmin.js";

const AuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication failed: No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken) {
      throw new ApiError(401, "Authentication failed: Invalid token");
    }

    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      throw new ApiError(401, "Authentication failed: User record missing");
    }

    req.user = userDoc.data();
    
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return next(new ApiError(401, "Authentication failed: Token expired"));
    }
    
    if (error.code === 'auth/argument-error') {
      return next(new ApiError(401, "Authentication failed: Token malformed"));
    }

    if (error instanceof ApiError) {
      return next(error);
    }

    return next(new ApiError(500, `Authentication exception: ${error.message}`));
  }
};

export default AuthMiddleware;


export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication failed: Profile missing from request");
    }

    if (req.user.role !== "admin") {
      throw new ApiError(403, "Access Matrix Denied: Admin privilege clearance required");
    }
    next();
  } catch (error) {
    next(error);
  }
};