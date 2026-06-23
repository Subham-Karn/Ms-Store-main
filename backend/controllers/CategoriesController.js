import { db } from "../db/firebaseAdmin.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";

// CREATE: Handles both Category (no parentId) and Subcategory (with parentId)
export const createCategory = async (req, res, next) => {
  const { c_title, userId, parentId } = req.body; 

  try {
    if (!c_title || !userId) {
      throw new ApiError(400, "Category title and User ID are required");
    }

    const docRef = db.collection("categories").doc();
    const categoryData = {
      id: docRef.id,
      c_title,
      userid: userId,
      parentId: parentId || null, // null = Root Category, string = Subcategory
      created_at: new Date().toISOString(),
    };

    await docRef.set(categoryData);

    return res
      .status(201)
      .json(new ApiResponse(201, categoryData, "Category/Subcategory created successfully"));
  } catch (error) {
    next(error);
  }
};

// READ: Fetches all categories AND organizes them into a hierarchy
export const getAllCategories = async (req, res, next) => {
  try {
    const snapshot = await db.collection("categories").get();
    const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Identify parents and children
    const parents = allDocs.filter(doc => !doc.parentId);
    const children = allDocs.filter(doc => doc.parentId);
   
    const hierarchy = parents.map(parent => ({
      ...parent,
      subcategories: children.filter(child => child.parentId === parent.c_title)
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, hierarchy, "Categories fetched and structured successfully"));
  } catch (error) {
    next(error);
  }
};

// UPDATE: Update title (Works for both categories and subcategories)
export const updateCategory = async (req, res, next) => {
  const { c_title, id } = req.body;

  try {
    if (!id || !c_title) {
      throw new ApiError(400, "Category ID and title are required");
    }

    const docRef = db.collection("categories").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new ApiError(404, "Category not found");
    }

    await docRef.update({ c_title });

    return res
      .status(200)
      .json(new ApiResponse(200, { id, c_title }, "Category updated successfully"));
  } catch (error) {
    next(error);
  }
};

// DELETE: Deletes category. If it's a parent, you may choose to delete children too.
export const deleteCategory = async (req, res, next) => {
  const { id } = req.body;

  try {
    if (!id) throw new ApiError(400, "Category ID is required");

    const docRef = db.collection("categories").doc(id);
    
    // Optional: Delete children if this is a parent category
    const childrenSnapshot = await db.collection("categories").where("parentId", "==", id).get();
    const batch = db.batch();
    
    childrenSnapshot.forEach(doc => batch.delete(doc.ref));
    batch.delete(docRef);
    
    await batch.commit();

    return res
      .status(200)
      .json(new ApiResponse(200, { id }, "Category and its subcategories deleted successfully"));
  } catch (error) {
    next(error);
  }
};