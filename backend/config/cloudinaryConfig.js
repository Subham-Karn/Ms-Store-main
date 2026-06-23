import { v2 as cloudinary } from "cloudinary";

if (!process.env.CLOUD_NAME || !process.env.CLOUD_API || !process.env.CLOUD_SECRET) {
  console.error("CRITICAL: Cloudinary environment variables are missing.");
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET,
  secure: true, 
  timeout: 60000, 
});

export default cloudinary;