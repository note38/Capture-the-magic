const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary with inline credentials
cloudinary.config({ 
  cloud_name: 'dr1mk4f7r', 
  api_key: '332752997996956', 
  api_secret: 'o5ecTRWzbRTl7b8Pmv9hNwQvKgI' 
});

async function runCloudinaryTasks() {
  try {
    // 2. Upload an image
    console.log("Uploading image...");
    const uploadResult = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { public_id: "sample_upload_test" }
    );
    
    console.log("Upload successful!");
    console.log("Secure URL:", uploadResult.secure_url);
    console.log("Public ID:", uploadResult.public_id);

    // 3. Get image details
    console.log("\nFetching image details...");
    const details = await cloudinary.api.resource(uploadResult.public_id);
    
    console.log("Width:", details.width);
    console.log("Height:", details.height);
    console.log("Format:", details.format);
    console.log("File size (bytes):", details.bytes);

    // 4. Transform the image
    // f_auto (fetch_format: 'auto'): Automatically selects the most efficient image format (e.g., WebP or AVIF) for the requesting browser.
    // q_auto (quality: 'auto'): Automatically applies compression to reduce file size while maintaining visual quality.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto"
    });

    console.log("\nDone! Click link below to see optimized version of the image. Check the size and the format.");
    console.log(transformedUrl);

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

runCloudinaryTasks();
