// const axios = require("axios");
// const crypto = require("crypto");

// const API_URL = "<API_URL>"; // Replace with the actual API URL
// const OPERATOR_CODE = "xxx"; // Your operator code
// const PROVIDER_CODE = "JK"; // Provider code
// const SECRET_KEY = "your_secret_key"; // Secret key for signature

// // Generate MD5 Signature
// const generateSignature = (operatorCode, providerCode, secretKey) => {
//     return crypto
//         .createHash("md5")
//         .update(operatorCode + providerCode + secretKey)
//         .digest("hex")
//         .toUpperCase();
// };

// // Function to launch the app
// const launchApp = async (username, password) => {
//     try {
//         // Ensure username length is between 3 and 12 characters
//         if (username.length < 3 || username.length > 12) {
//             throw new Error("Username must be between 3 and 12 characters.");
//         }

//         // Generate signature
//         const signature = generateSignature(OPERATOR_CODE, PROVIDER_CODE, SECRET_KEY);

//         // Construct API request URL
//         const url = `${API_URL}/launchAPP.ashx?operatorcode=${OPERATOR_CODE}&providercode=${PROVIDER_CODE}&username=${username}&password=${password}&signature=${signature}`;

//         // Make GET request
//         const response = await axios.get(url);

//         // Check API response
//         if (response.data.errCode !== "0") {
//             console.log("Error:", response.data.errMsg);
//             throw new Error(`Error: ${response.data.errMsg}`);
//         }
//             console.log("API Response:", response.data);
//         return response.data.gameUrl; // Returns the deep link URL
//     } catch (error) {
//         console.error("Error launching app:", error.message);
//         return null;
//     }
// };

// // Example usage
// // launchApp("test001", "paysa88").then((url) => {
// //     if (url) {
// //         console.log("Game URL:", url);
// //     } else {
// //         console.log("Failed to launch app.");
// //     }
// // });
