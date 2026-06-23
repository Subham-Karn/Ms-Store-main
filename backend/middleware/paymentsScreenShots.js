import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig.js';
import { ApiError } from '../util/ApiError.js';

// 1. Validate that the uploaded file is an image
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Invalid file type. Only images are allowed for screenshots."), false);
  }
};
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

export const uploadPaymentScreenshot = [
  upload.single("payment_screenshot"), 
  async (req, res, next) => {
    try {
      if (!req.file) {
        return next();
      }
      const result = await new Promise((resolve, reject) => {
        // Ensure your cloudinaryConfig.js exports cloudinary.v2
        const stream = cloudinary.uploader.upload_stream(
          { folder: "payments" },
          (error, cloudResult) => {
            if (error) reject(error);
            else resolve(cloudResult);
          }
        );
        stream.end(req.file.buffer);
      });
      console.log(result.secure_url);
      
      req.body.payment_screenshot = result.secure_url;
      
      next();
    } catch (error) {
      console.error("Cloudinary payment upload error:", error);
      return next(new ApiError(500, `Payment screenshot upload failed: ${error.message}`));
    }
  },
];

export default uploadPaymentScreenshot;