// utils/generateQR.js
const qr = require('qr-image');

const generateQRCode = async (text) => {
  try {
    // const qr_png = qr.imageSync(text, { type: 'png' });
    // return qr_png.toString('base64');
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      color: {
        dark: favcolor || '#000000',
        light: '#FFFFFF'
      },
      width: 256,
      margin: 1
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('QR code generation failed');
  }
};

module.exports = generateQRCode;