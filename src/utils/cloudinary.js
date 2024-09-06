import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, fileType) => {
    try {
        if (!localFilePath) return null;

        let uploadOptions = {
            resource_type: "auto",
        };

        // If it's a video, ensure audio is included
        if (fileType === "video") {
            uploadOptions = {
                ...uploadOptions,
                resource_type: "video",
                audio_codec: "aac", // Specify audio codec
                video_codec: "auto", // Let Cloudinary choose the best video codec
            };
        }

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, uploadOptions);

        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);

        console.log("File successfully uploaded on Cloudinary", response.url);
        return response;

    } catch (error) {
        // Remove the locally saved temporary file as the upload operation failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Failed to upload file on Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary };


// (async function () {
//   // Configuration
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
//   });

//   // Upload an image
//   const uploadResult = await cloudinary.uploader
//     .upload(
//       "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
//       {
//         public_id: "shoes",
//       }
//     )
//     .catch((error) => {
//       console.log(error);
//     });

//   console.log(uploadResult);

//   // Optimize delivery by resizing and applying auto-format and auto-quality
//   const optimizeUrl = cloudinary.url("shoes", {
//     fetch_format: "auto",
//     quality: "auto",
//   });

//   console.log(optimizeUrl);

//   // Transform the image: auto-crop to square aspect_ratio
//   const autoCropUrl = cloudinary.url("shoes", {
//     crop: "auto",
//     gravity: "auto",
//     width: 500,
//     height: 500,
//   });

//   console.log(autoCropUrl);
// })();
