import { db } from "../db/firebaseAdmin.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";

export const addProducts = async (req, res, next) => {
  const {
    title,
    description,
    orignalprice,
    discountprice,
    offer,
    stock,
    skuId,
    category,
    subcategory,
    shipping_charge,
    userId,
    submenu,
    menu,
    submenu_id,
  } = req.body;
  const bunner = req.body.bunner || null;
  const thumbnails = req.body.thumbnails || [];
  const tagsArray = req.body.tags
    ? typeof req.body.tags === "string"
      ? JSON.parse(req.body.tags)
      : req.body.tags
    : [];

  console.log("Bunner received in controller:", bunner);

  try {
    if (!userId) throw new ApiError(400, "User is not logged in");

    // Dynamic Validation
    const requiredFields = {
      Title: title,
      Description: description,
      "Banner Image": bunner,
      "Original Price": orignalprice,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key],
    );

    if (missingFields.length > 0) {
      throw new ApiError(
        400,
        `Missing required fields: ${missingFields.join(", ")}`,
      );
    }

    const docRef = db.collection("products").doc();
    const productPayload = {
      pid: docRef.id,
      title,
      description,
      bunner,
      thumbnails,
      orignalprice: Number(orignalprice),
      discountprice: Number(discountprice) || 0,
      offer: offer || 0,
      stock: Number(stock) || 0,
      skuid: skuId || "",
      menu: menu || "",
      submenu: submenu || "",
      submenu_id: submenu_id || 0,
      category: category || "",
      subcategory: subcategory || "",
      tags: tagsArray,
      userid: userId,
      shipping_charge: Number(shipping_charge) || 0,
      created_at: new Date().toISOString(),
    };

    await docRef.set(productPayload);
    return res
      .status(201)
      .json(
        new ApiResponse(201, productPayload, "Catalog Added Successfully!"),
      );
  } catch (error) {
    next(error);
  }
};

const generateSafeId = (str) =>
  str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

export const addBulkProducts = async (req, res, next) => {
  try {
    const { userId, products } = req.body;

    // 1. Validation
    if (!userId) throw new ApiError(400, "User context validation failed");
    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new ApiError(
        400,
        "Please provide a valid array of products to import",
      );
    }

    const batch = db.batch();
    const insertedProducts = [];

    const uniqueMenus = [
      ...new Set(products.map((p) => p.menu).filter(Boolean)),
    ];
    const uniqueSubmenus = [
      ...new Set(products.map((p) => p.submenu).filter(Boolean)),
    ];
    const uniqueCategories = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    const uniqueSubcategories = [
      ...new Set(products.map((p) => p.subcategory).filter(Boolean)),
    ];

    uniqueMenus.forEach((menu) => {
      batch.set(
        db.collection("menus").doc(generateSafeId(menu)),
        { name: menu.trim() },
        { merge: true },
      );
    });

    uniqueSubmenus.forEach((submenu) => {
      batch.set(
        db.collection("submenus").doc(generateSafeId(submenu)),
        { name: submenu.trim() },
        { merge: true },
      );
    });

    uniqueCategories.forEach((category) => {
      batch.set(
        db.collection("categories").doc(generateSafeId(category)),
        { name: category.trim() },
        { merge: true },
      );
    });

    uniqueSubcategories.forEach((subcategory) => {
      batch.set(
        db.collection("subcategories").doc(generateSafeId(subcategory)),
        { name: subcategory.trim() },
        { merge: true },
      );
    });

    // 4. Iterate and sanitize each product
    for (const item of products) {
      const docRef = db.collection("products").doc();

      const parsedThumbnails = Array.isArray(item.thumbnails)
        ? item.thumbnails
        : [];
      const parsedTags = Array.isArray(item.tags) ? item.tags : [];

      const productPayload = {
        pid: docRef.id,
        title: item.title || "",
        description: item.description || "",
        bunner: item.bunner || null,
        thumbnails: parsedThumbnails,
        orignalprice: Number(item.orignalprice) || 0,
        discountprice: Number(item.discountprice) || 0,
        offer: item.offer || 0,
        stock: Number(item.stock) || 0,
        skuid: item.skuid || "",
        category: item.category || "",
        menu: item.menu || "",
        submenu: item.submenu || "",
        subcategory: item.subcategory || "",
        tags: parsedTags,
        userid: userId,
        shipping_charge: Number(item.shipping_charge) || 0,
        created_at: new Date().toISOString(),
      };

      batch.set(docRef, productPayload);
      insertedProducts.push(productPayload);
    }

    // 5. Commit the batch to Firestore
    await batch.commit();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { count: insertedProducts.length },
          "Bulk products and missing categories saved successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = [];

    snapshot.forEach((doc) => products.push(doc.data()));

    if (products.length === 0) {
      throw new ApiError(
        404,
        "No products found inside catalog infrastructure",
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, products, "All items compiled successfully"));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) throw new ApiError(400, "Target reference pointer tracking error");

    const doc = await db.collection("products").doc(id).get();
    if (!doc.exists) {
      throw new ApiError(
        404,
        "No match discovered against targeting profile tracking pointer",
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, doc.data(), "Catalog asset located successfully"),
      );
  } catch (error) {
    next(error);
  }
};

export const productsUpdate = async (req, res, next) => {
  const { id } = req.params;
  const { userid, tags, bunner, thumbnails, ...fields } = req.body;

  let tagsArray;
  if (tags) {
    tagsArray = typeof tags === "string" ? JSON.parse(tags) : tags;
  }
  const updateData = {
    ...fields,
    ...(bunner && { bunner }),
    ...(thumbnails && thumbnails.length > 0 && { thumbnails }),
    ...(tagsArray && { tags: tagsArray }),
    ...(userid && { userid }),
    updated_at: new Date().toISOString(),
  };
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key],
  );

  try {
    if (!id) throw new ApiError(400, "Invalid ID provided");

    const docRef = db.collection("products").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new ApiError(404, "Product not found");
    }

    await docRef.update(updateData);

    return res
      .status(200)
      .json(new ApiResponse(200, { id }, "Product updated successfully"));
  } catch (error) {
    next(error);
  }
};
export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id)
      throw new ApiError(400, "Tracking validation sequence interrupted");

    const docRef = db.collection("products").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new ApiError(
        404,
        "Target entry execution index sequence context mismatch",
      );
    }

    await docRef.delete();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { id },
          "Catalog tracking array node purged successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const updateSKUID = async (req, res, next) => {
  const { id } = req.params;
  const { skuId } = req.body;

  try {
    if (!id || skuId === undefined) {
      throw new ApiError(
        400,
        "Validation verification matrix constraints breached",
      );
    }

    const docRef = db.collection("products").doc(id);
    await docRef.update({ skuid: skuId, updated_at: new Date().toISOString() });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { id, skuId },
          "Inventory identification array updated",
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  const { id } = req.params;
  const { stock } = req.body;

  try {
    if (!id || stock === undefined) {
      throw new ApiError(
        400,
        "Validation verification mapping parameters broken",
      );
    }

    const docRef = db.collection("products").doc(id);
    await docRef.update({
      stock: Number(stock),
      updated_at: new Date().toISOString(),
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { id, stock: Number(stock) },
          "Inventory distribution data synchronized",
        ),
      );
  } catch (error) {
    next(error);
  }
};
