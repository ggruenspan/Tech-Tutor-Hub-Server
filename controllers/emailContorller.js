// controllers/emailControllers.js

const nodemailer = require('nodemailer');

// Function to send a email
function sendEmail(res, email, subject, message, resMessage) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: 'Tech Tutor Hub <solodevinnovations@gmail.com>',
        to: email,
        subject: subject,
        html: message,
    };

    
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while sending the email' });
        }
        return res.status(200).json({ message: resMessage });
    });
}

// Export the controller functions
module.exports = {
    sendEmail
}