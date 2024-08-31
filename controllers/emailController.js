// controllers/emailControllers.js

const nodemailer = require('nodemailer');
const fromEmail = 'Tech Tutor Hub <solodevinnovations@gmail.com>';

// Function to send a verification email
function sendResetPasswordEmail(email, firstName, resetToken) {
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
            html: 
                `
                    <p>Dear ${firstName},</p>
                    <p>You are receiving this because you (or someone else) have requested to reset the password for your account.</p>
                    <p>Please click the link below, or paste it into your browser, to complete the process:</p>
                    <p><a href="${resetPasswordLink}"><strong>Reset Password</strong></a></p>
                    <p><strong>This link is valid for 1 hour.</strong> If you do not reset your password within this time, the link will expire, and you will need to request another reset link.</p>
                    <p>If you did not request this, please disregard this email, and your password will remain unchanged.</p>
                    <p>Best regards,<br>Your Company Name Team</p>
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
function sendVerificationEmail(email, firstName, verificationToken) {
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
            html: 
                `
                    <p>Dear ${firstName},</p>
                    <p>You are receiving this because you (or someone else) have created an account using this email address.</p>
                    <p>Please click the link below, or paste it into your browser, to complete the verification process:</p>
                    <p><a href="${verificationLink}"><strong>Verify Email</strong></a></p>
                    <p><strong>This link is valid for 1 hour.</strong> If you do not verify your email within this time, your account will be automatically deleted, and you will need to register again.</p>
                    <p>If you did not create this account, please disregard this email. If you have any concerns or suspect that your email address may be compromised, we strongly recommend contacting our support team for assistance.</p>
                    <p>Your security is our priority, and we're here to help you secure your account.</p>
                    <p>Best regards,<br>Your Company Name Team</p>
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
