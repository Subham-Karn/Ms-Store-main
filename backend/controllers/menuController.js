import { db } from "../db/firebaseAdmin.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";

// --- MENU (Parent) OPERATIONS ---

export const createMenu = async (req, res, next) => {
  const { menu_name, menu_slug } = req.body;

  try {
    if (!menu_name || !menu_slug) {
      throw new ApiError(400, "Menu name and slug are required");
    }

    const docRef = db.collection("menu").doc();
    const menuData = {
      id: docRef.id,
      name: menu_name,
      slug: menu_slug,
      created_at: new Date().toISOString(),
    };

    await docRef.set(menuData);

    return res
      .status(201)
      .json(new ApiResponse(201, menuData, "Menu created successfully"));
  } catch (error) {
    next(error);
  }
};

// --- SUBMENU (Child) OPERATIONS ---

export const createSubMenu = async (req, res, next) => {
  const { menu_id, sub_menu_name, sub_menu_slug } = req.body;

  try {
    if (!menu_id || !sub_menu_name || !sub_menu_slug) {
      throw new ApiError(400, "Menu ID, Submenu name, and slug are required");
    }

    // Verify parent menu exists
    const menuDoc = await db.collection("menu").doc(menu_id).get();
    if (!menuDoc.exists) {
      throw new ApiError(404, `Menu with ID ${menu_id} not found`);
    }

    const docRef = db.collection("submenu").doc();
    const subMenuData = {
      id: docRef.id,
      menu_id, // Foreign key linking to parent
      name: sub_menu_name,
      slug: sub_menu_slug,
      created_at: new Date().toISOString(),
    };

    await docRef.set(subMenuData);

    return res
      .status(201)
      .json(new ApiResponse(201, subMenuData, "Submenu created successfully"));
  } catch (error) {
    next(error);
  }
};

// --- GET (Combined Hierarchy) ---

export const getAllMenusWithSubMenu = async (req, res, next) => {
  try {
    // Parallel fetching for performance
    const [menuSnap, subSnap] = await Promise.all([
      db.collection("menu").get(),
      db.collection("submenu").get()
    ]);

    const menus = menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const submenus = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Map submenus into their respective parent menus
    const result = menus.map((menu) => ({
      ...menu,
      submenus: submenus.filter((sub) => sub.menu_id === menu.id),
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Menus with submenus fetched"));
  } catch (error) {
    next(error);
  }
};

// --- UPDATE & DELETE (The Missing Pieces) ---

export const updateSubMenu = async (req, res, next) => {
  const { id } = req.params;
  const { sub_menu_name, sub_menu_slug } = req.body;

  try {
    const docRef = db.collection("submenu").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) throw new ApiError(404, "Submenu not found");

    const updatedData = { name: sub_menu_name, slug: sub_menu_slug };
    await docRef.update(updatedData);

    return res.status(200).json(new ApiResponse(200, { id, ...updatedData }, "Submenu updated"));
  } catch (error) {
    next(error);
  }
};

export const deleteSubMenu = async (req, res, next) => {
  const { id } = req.params;
  try {
    const docRef = db.collection("submenu").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) throw new ApiError(404, "Submenu not found");
    
    await docRef.delete();
    return res.status(200).json(new ApiResponse(200, { id }, "Submenu deleted"));
  } catch (error) {
    next(error);
  }
};

export const deleteMenu = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) {
      throw new ApiError(400, "Menu ID is required");
    }

    const docRef = db.collection("menu").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new ApiError(404, "Menu not found");
    }

    // Use a batch to delete the menu AND all its associated submenus
    const batch = db.batch();
    
    // 1. Delete the parent menu
    batch.delete(docRef);

    // 2. Find and delete all submenus linked to this menu_id
    const submenusSnapshot = await db.collection("submenu")
      .where("menu_id", "==", id)
      .get();

    submenusSnapshot.forEach((subMenuDoc) => {
      batch.delete(subMenuDoc.ref);
    });

    // 3. Commit the atomic operation
    await batch.commit();

    return res
      .status(200)
      .json(new ApiResponse(200, { id }, "Menu and its related submenus deleted successfully"));
  } catch (error) {
    next(error);
  }
};