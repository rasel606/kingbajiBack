const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kingbaji247@gmail.com', // your email
      pass: 'Saikat12$', // your app password
    },
  });

  const mailOptions = {
    from: 'Your Company <yourcompany@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
