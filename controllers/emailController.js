// controllers/emailControllers.js

const nodemailer = require('nodemailer');
const fromEmail = 'Tech Tutor Hub <solodevinnovations@gmail.com>';

// Function to send a verification email
function sendResetPasswordEmail(email, resetToken) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
        });

        const resetPasswordLink = `https://localhost:4200/reset-password/${resetToken}`;

        const mailOptions = {
            from: fromEmail,
            to: email,
            subject: 'Password Reset',
            html: `
                <p>You are receiving this because you (or someone else) has requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <p><a href="${resetPasswordLink}">Reset Password</a></p>
                <p>This link is valid for 30 minutes. If you do not reset your password within this time, you will need to request another reset link.</p>
                <p>If you did not request this, please ignore this email, and your password will remain unchanged.</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
}

// Function to send a verification email
function sendVerificationEmail(email, verificationToken) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
        });

        const verificationLink = `https://localhost:4200/verify-email/${verificationToken}`;

        const mailOptions = {
            from: fromEmail,
            to: email,
            subject: 'Please verify your email address',
            html: `
                <p>Hello, you are receiving this because you (or someone else) has created an account using this email.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <p><a href="${verificationLink}">Verify Email</a></p>
                <p>This link is valid for 30 minutes. If you do not verify your email within this time, you will need to request another verification link.</p>
                <p>If you did not create this account, please ignore this email. However, if you have any concerns or suspect that your email address may be compromised, we recommend to contact our support team for assistance.</p>
                <p>We take your security seriously and will help you secure your account.</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
}

// Export the controller functions
module.exports = {
    sendResetPasswordEmail,
    sendVerificationEmail
};
