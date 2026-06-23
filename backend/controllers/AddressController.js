import { db } from "../db/firebaseAdmin.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import generateBigInt from "../util/generateBigInt.js";

export const createAddress = async (req, res, next) => {
  const {
    user_id,
    street,
    city,
    state,
    pincode,
    landmark,
    fullName,
    phoneNumber,
    email,
    setDefault,
  } = req.body;

  try {
    if (!user_id || !street || !city || !state || !pincode || !fullName || !email) {
      throw new ApiError(400, "All fields are required");
    }

    const isDefaultValue = setDefault || false;
    const addressesRef = db.collection("usersaddress");

    // If setting as default, reset previous defaults first
    if (isDefaultValue) {
      const defaultSnapshot = await addressesRef
        .where("userid", "==", user_id)
        .where("isdefault", "==", true)
        .get();

      if (!defaultSnapshot.empty) {
        const batch = db.batch();
        defaultSnapshot.forEach((doc) => {
          batch.update(doc.ref, { isdefault: false });
        });
        await batch.commit();
      }
    }

    const addressId = generateBigInt();
    const docRef = addressesRef.doc(addressId);

    const addressPayload = {
      add_id: addressId,
      userid: user_id,
      fullName,
      phoneNumber: phoneNumber || null,
      email,
      street,
      city,
      state,
      pincode,
      landmark: landmark || null,
      isdefault: isDefaultValue,
      created_at: new Date().toISOString(),
    };

    await docRef.set(addressPayload);

    return res
      .status(200)
      .json(new ApiResponse(200, [addressPayload], "Address created successfully"));
  } catch (error) {
    next(error);
  }
};

export const changeDefaultAddress = async (req, res, next) => {
  const { user_id, address_id } = req.params;
  const { setDefault } = req.body;

  try {
    if (!user_id || !address_id) {
      throw new ApiError(400, "All fields are required");
    }

    const addressesRef = db.collection("usersaddress");

    // Reset all addresses for this user to false
    const userAddressesSnapshot = await addressesRef.where("userid", "==", user_id).get();
    const batch = db.batch();
    
    userAddressesSnapshot.forEach((doc) => {
      batch.update(doc.ref, { isdefault: false });
    });
    await batch.commit();

    // Now update the target address with the new default state
    const targetDocRef = addressesRef.doc(address_id);
    const targetDoc = await targetDocRef.get();

    if (!targetDoc.exists) {
      throw new ApiError(404, "Address not found");
    }

    await targetDocRef.update({ isdefault: setDefault || false });
    const updatedDoc = await targetDocRef.get();

    return res
      .status(200)
      .json(new ApiResponse(200, [updatedDoc.data()], "Default address updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const getAddressesByUserId = async (req, res, next) => {
  const { user_id } = req.params;

  try {
    if (!user_id) throw new ApiError(400, "User ID is required");

    const snapshot = await db.collection("usersaddress").where("userid", "==", user_id).get();
    const addresses = [];

    snapshot.forEach((doc) => addresses.push(doc.data()));

    return res
      .status(200)
      .json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  const { address_id } = req.params;
  const {
    user_id, // Recommended to pass this to handle defaults accurately
    street,
    city,
    state,
    pincode,
    landmark,
    fullName,
    phoneNumber,
    email,
    setDefault,
  } = req.body;

  try {
    if (!street || !city || !state || !pincode || !fullName || !phoneNumber || !email) {
      throw new ApiError(400, "All fields are required");
    }

    const docRef = db.collection("usersaddress").doc(address_id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new ApiError(404, "Address not found");
    }

    const targetUserId = user_id || doc.data().userid;
    const isDefaultValue = setDefault || false;

    // Handle turning default flag on
    if (isDefaultValue) {
      const defaultSnapshot = await db.collection("usersaddress")
        .where("userid", "==", targetUserId)
        .where("isdefault", "==", true)
        .get();

      if (!defaultSnapshot.empty) {
        const batch = db.batch();
        defaultSnapshot.forEach((d) => {
          if (d.id !== address_id) {
            batch.update(d.ref, { isdefault: false });
          }
        });
        await batch.commit();
      }
    }

    const updatedFields = {
      fullName,
      phoneNumber,
      email,
      street,
      city,
      state,
      pincode,
      landmark: landmark || null,
      isdefault: isDefaultValue,
      updated_at: new Date().toISOString(),
    };

    await docRef.update(updatedFields);
    const updatedDoc = await docRef.get();

    return res
      .status(200)
      .json(new ApiResponse(200, [updatedDoc.data()], "Address updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  const { address_id, user_id } = req.params;

  try {
    if (!address_id || !user_id) {
      throw new ApiError(400, "user_id and address_id are required in the URL params");
    }

    const docRef = db.collection("usersaddress").doc(address_id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new ApiError(404, "Address not found");
    }

    // Security check to verify document ownership matching URL parameter vectors
    if (doc.data().userid !== user_id) {
      throw new ApiError(403, "Unauthorized address removal mapping exception");
    }

    const deletedData = doc.data();
    await docRef.delete();

    return res
      .status(200)
      .json(new ApiResponse(200, [deletedData], "Address deleted successfully"));
  } catch (error) {
    next(error);
  }
};