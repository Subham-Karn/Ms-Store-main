import { auth, db } from "../db/firebaseAdmin.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import axios from "axios"
export const signUpUser = async (req, res, next) => {
  const { email, password, role = "coustomer" } = req.body;

  try {
    if ( !email || !password) {
      throw new ApiError(400, "Email, and Password are required");
    }

    const WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;
    if (!WEB_API_KEY) {
      throw new ApiError(500, "Server Configuration Error: Web API Key missing");
    }

    const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${WEB_API_KEY}`;

    let firebaseResponse;
    try {
      firebaseResponse = await axios.post(endpoint, {
        email: email.toLowerCase().trim(),
        password,
        returnSecureToken: true,
      });
    }catch (axiosError) {
      console.error(
        "FIREBASE RAW ERROR:", 
        axiosError.response ? axiosError.response.data : axiosError.message
      );

      const errorMsg = axiosError.response?.data?.error?.message || "REGISTRATION_FAILED";
      
      if (errorMsg === "EMAIL_EXISTS") throw new ApiError(409, "Email already exists");
      if (errorMsg === "WEAK_PASSWORD") throw new ApiError(400, "Password must be at least 6 characters");
      
      throw new ApiError(400, `Signup Failed: ${errorMsg}`);
    }

    const { idToken, refreshToken, expiresIn, localId  } = firebaseResponse.data;

    const newUserData = {
      id: localId,
      fullName: email.split("@")[0],
      email: email.toLowerCase().trim(),
      role,
      avatarUrl: "",
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(localId).set(newUserData);

    return res.status(201).json(
      new ApiResponse(201, {
        token: idToken,
        refreshToken,
      }, "Signup Successfully")
    );

  } catch (error) {
    next(error);
  }
};

export const CreateUserByAdmin = async (req, res, next) => {
  try {
    // Note: Mapped both 'phone' and 'phoneNumber' to catch it regardless of what the frontend sends
    const { fullName, email, password, phone, phoneNumber, role = "customer" } = req.body;

    // 1. Validation
    if (!email || !password || !fullName) {
      throw new ApiError(400, "Full Name, Email, and Password are required");
    }

    const WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;
    if (!WEB_API_KEY) {
      throw new ApiError(500, "Server Configuration Error: Web API Key missing");
    }

    // 2. Create the user in Firebase Auth via REST API
    const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${WEB_API_KEY}`;

    let firebaseResponse;
    try {
      firebaseResponse = await axios.post(endpoint, {
        email: email.toLowerCase().trim(),
        password: password,
        returnSecureToken: false,
      });
    } catch (axiosError) {
      console.error(
        "FIREBASE RAW ERROR (Admin Create):", 
        axiosError.response ? axiosError.response.data : axiosError.message
      );

      const errorMsg = axiosError.response?.data?.error?.message || "CREATION_FAILED";
      
      if (errorMsg === "EMAIL_EXISTS") throw new ApiError(409, "A user with this email already exists");
      if (errorMsg === "WEAK_PASSWORD") throw new ApiError(400, "Password must be at least 6 characters");
      
      throw new ApiError(400, `Failed to create user: ${errorMsg}`);
    }

    const { localId } = firebaseResponse.data;

    // 3. Save the new user's profile to Firestore
    const newUserData = {
      id: localId,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber || phone || "",
      role: role.toLowerCase(), 
      avatarUrl: "",
      isVerified: false,
      createdAt: new Date().toISOString(),
      createdByAdmin: true
    };
    await db.collection("users").doc(localId).set(newUserData);
    return res.status(201).json(
      new ApiResponse(201,{ user:newUserData}, "User account created successfully")
    );

  } catch (error) {
    next(error);
  }
};

export const LoginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new ApiError(400, "Authentication aborted: Both Email and Password are required fields");
    }

    const WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;
    if (!WEB_API_KEY) {
      throw new ApiError(500, "Server Configuration Error: Web API Key missing from environment parameters");
    }

    const firebaseIdentityEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${WEB_API_KEY}`;

    let firebaseResponse;
    try {
      firebaseResponse = await axios.post(firebaseIdentityEndpoint, {
        email: email.toLowerCase().trim(),
        password,
        returnSecureToken: true,
      });
    } catch (axiosError) {
      const firebaseErrorString = axiosError.response?.data?.error?.message || "AUTHENTICATION_FAILED";
      
      if (firebaseErrorString === "INVALID_PASSWORD" || firebaseErrorString === "EMAIL_NOT_FOUND") {
        throw new ApiError(401, "Invalid Credentials: Your email or password combination is incorrect");
      }
      if (firebaseErrorString === "USER_DISABLED") {
        throw new ApiError(403, "Access Revoked: This collector account profile has been disabled");
      }
      
      throw new ApiError(401, `Identity Handshake Interrupted: ${firebaseErrorString}`);
    }
    const { idToken, refreshToken, expiresIn, localId } = firebaseResponse.data;
    return res
      .status(200)
      .json(
        new ApiResponse(
          200, 
          { 
            token: idToken,
            refreshToken
          }, 
          `Welcome Back ${email.split('@')[0].trim()}`
        )
      );

  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      users.push(doc.data());
    });

    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const manageUser = async (req, res, next) => {
  const { action, role } = req.body;
  const { userId } = req.params;

  try {
    if (!userId) throw new ApiError(400, "User ID is required");

    const { auth } = await import("../db/firebaseAdmin.js");
    const userDocRef = db.collection("users").doc(userId);

    switch (action) {
      case "delete":
        await userDocRef.delete();
        await auth.deleteUser(userId);
        return res.json(new ApiResponse(200, null, "User deleted successfully"));

      case "ban":
        await auth.updateUser(userId, { disabled: true });
        await userDocRef.update({ status: "banned" });
        return res.json(new ApiResponse(200, null, "User banned successfully"));

      case "unban":
        await auth.updateUser(userId, { disabled: false });
        await userDocRef.update({ status: "active" });
        return res.json(new ApiResponse(200, null, "User unbanned successfully"));

      case "updateRole":
        if (!role) throw new ApiError(400, "Role is required");

        await auth.setCustomUserClaims(userId, { role });
        await userDocRef.update({ role });

        return res.json(new ApiResponse(200, null, `User role updated to ${role}`));

      default:
        throw new ApiError(400, "Invalid action");
    }
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  const { idToken } = req.body;

  try {
    if (!idToken) {
      throw new ApiError(400, "Firebase ID token is required");
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const { email, uid } = decodedToken;

    const userDocRef = db.collection("users").doc(uid);
    const userDoc = await userDocRef.get();

    let userData;

    if (!userDoc.exists) {
      const extractedUsername = email.split("@")[0].replace(/[0-9]/g, '');
      
      userData = {
        id: uid,
        fullName: extractedUsername,
        email: email.toLowerCase().trim(),
        role: "coustomer",
        avatarUrl: "",
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      
      await userDocRef.set(userData);
    } else {
      userData = userDoc.data();
    }

    return res.status(200).json(
      new ApiResponse(200, {  token: idToken }, "Google Authentication Successful")
    );

  } catch (error) {
    if (error.code && error.code.startsWith('auth/')) {
      return next(new ApiError(401, "Invalid or expired Firebase token"));
    }
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const uid = req.user?.id || req.user?.uid;

    if (uid) {
      await auth.revokeRefreshTokens(uid);
    }

    return res.status(200).json(
      new ApiResponse(200, null, "Logged out successfully from all active sessions")
    );
  } catch (error) {
    next(new ApiError(500, "Failed to revoke authentication tokens"));
  }
};