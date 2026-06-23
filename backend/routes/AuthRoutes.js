import { Router } from "express";
import { getAllUsers, manageUser, signUpUser, LoginUser, googleAuth, logoutUser, CreateUserByAdmin } from "../controllers/AuthController.js";
import { auth, db } from "../db/firebaseAdmin.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import AuthMiddleware, { isAdmin } from "../middleware/AuthMiddleware.js";

const router = Router();

router.post("/signup", signUpUser);
router.post("/login", LoginUser);
router.post("/create/user" , AuthMiddleware, isAdmin , CreateUserByAdmin );
router.get("/users", getAllUsers);
router.post("/users/:userId/manage", manageUser);

router.get("/user", AuthMiddleware, (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(404, "User profile data not found in request context");
    }

    return res.status(200).json(
      new ApiResponse(200, { user }, "User profile retrieved successfully")
    );
    
  } catch (error) {
    next(error);
  }
});

router.post("/logout", AuthMiddleware, logoutUser);


router.post("/google-auth" , googleAuth);


export default router;