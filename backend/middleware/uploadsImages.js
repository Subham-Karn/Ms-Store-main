import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig.js';
import { ApiError } from '../util/ApiError.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadImagesForProducts = (fields = []) => [
  upload.fields(fields),
  async (req, res, next) => {
    if (!req.files) return next();

    try {
      await Promise.all(
        fields.map(async (field) => {
          const files = req.files[field.name] || [];
          const uploadPromises = files.map((file) =>
            new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (error, result) => (error ? reject(error) : resolve(result.secure_url))
              );
              stream.end(file.buffer);
            })
          );

          const urls = await Promise.all(uploadPromises);
          // Inject directly into req.body so the controller picks them up
          req.body[field.name] = field.maxCount === 1 ? urls[0] : urls;
        })
      );
      next();
    } catch (error) {
      next(new ApiError(500, `Image upload failed: ${error.message}`));
    }
  },
];

export default uploadImagesForProducts