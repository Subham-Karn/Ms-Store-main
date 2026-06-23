import { db } from "../db/firebaseAdmin.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";

export const createComment = async (req, res, next) => {
  const { pid, userid, comment, rate } = req.body;

  try {
    if (!pid) throw new ApiError(400, "Product Id is Not Defined!");
    if (!userid) throw new ApiError(400, "User Id is Not Defined!");
    if (!comment) throw new ApiError(400, "Comment is Not Defined!");
    if (!rate) throw new ApiError(400, "Rate is Not Defined!");

    const commentDocRef = db.collection("comments").doc();
    const commentData = {
      cid: commentDocRef.id,
      pid,
      userid,
      comment,
      rate: Number(rate),
      created_at: new Date().toISOString(),
    };

    await commentDocRef.set(commentData);

    const commentsSnapshot = await db.collection("comments").where("pid", "==", pid).get();
    
    let totalRate = 0;
    commentsSnapshot.forEach((doc) => {
      totalRate += doc.data().rate;
    });
    
    const avgRate = commentsSnapshot.size > 0 ? totalRate / commentsSnapshot.size : 0;

    await db.collection("products").doc(pid).update({ rate: avgRate });

    return res
      .status(201)
      .json(new ApiResponse(201, { comment: commentData, newRate: avgRate }, "Comment added successfully"));
  } catch (error) {
    next(error);
  }
};

export const getAllComments = async (req, res, next) => {
  const { pid } = req.params;

  try {
    if (!pid) throw new ApiError(400, "Product ID is required");

    const commentsSnapshot = await db.collection("comments").where("pid", "==", pid).get();
    const comments = [];
    
    commentsSnapshot.forEach((doc) => {
      comments.push(doc.data());
    });

    if (comments.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No comments found"));
    }

    const usersSnapshot = await db.collection("users").get();
    const userMap = {};
    
    usersSnapshot.forEach((doc) => {
      const u = doc.data();
      userMap[u.id] = {
        id: u.id,
        email: u.email,
        avatar: u.avatar || null,
        fullName: u.full_name || u.fullName || "",
      };
    });

    const merged = comments.map((c) => ({
      ...c,
      user: userMap[c.userid] || null,
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, merged, "Comments fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  const { id, pid } = req.params;

  try {
    if (!id || !pid) {
      throw new ApiError(400, "Comment ID and Product ID are required");
    }

    const commentRef = db.collection("comments").doc(id);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      throw new ApiError(404, "Comment not found");
    }

    await commentRef.delete();

    const commentsSnapshot = await db.collection("comments").where("pid", "==", pid).get();
    
    let totalRate = 0;
    commentsSnapshot.forEach((doc) => {
      totalRate += doc.data().rate;
    });
    
    const avgRate = commentsSnapshot.size > 0 ? totalRate / commentsSnapshot.size : 0;

    await db.collection("products").doc(pid).update({ rate: avgRate });

    return res
      .status(200)
      .json(new ApiResponse(200, { avgRate }, "Comment deleted and product rating updated"));
  } catch (error) {
    next(error);
  }
};