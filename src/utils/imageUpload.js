const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const uploadToImageBB = async (imageData, fileName = 'kyc_document') => {
  try {
    // Check if imageData is a base64 string or a file path
    let imageContent;
    if (imageData.startsWith('data:image')) {
      // Extract base64 data from data URL
      imageContent = imageData.split(',')[1];
    } else if (fs.existsSync(imageData)) {
      // Read file from path
      imageContent = fs.readFileSync(imageData, { encoding: 'base64' });
    } else {
      throw new Error('Invalid image data provided');
    }

    const formData = new FormData();
    formData.append('image', imageContent);
    formData.append('name', fileName);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMAGEBB_API_KEY}`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    if (response.data.success) {
      return {
        url: response.data.data.url,
        deleteUrl: response.data.data.delete_url
      };
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Image upload error:', error.message);
    throw new Error('Failed to upload image to ImageBB');
  }
};

module.exports = { uploadToImageBB };