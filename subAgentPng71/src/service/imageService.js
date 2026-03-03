// import axios from 'axios';

// export const imageService = {
//   uploadToImgbb: async (file) => {
//     if (!file) throw new Error("No file provided");
//     const formData = new FormData();
//     formData.append("image", file);
//     const response = await axios.post(
//       `https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY`,
//       formData
//     );
//     return response.data.data.url;
//   },
// };


// src/service/imageService.js

export const imageService = {
  uploadToImgbb: async (file) => {
    if (!file) throw new Error("No file provided");
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.success) throw new Error("Image upload failed");

    return data.data.url;
  },
};
