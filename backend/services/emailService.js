const nodemailer = require("nodemailer");

const appName = "PizzaHub";

let transporter;

function canSendEmails() {
    return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

function getTransporter() {
    if (!canSendEmails()) {
        return null;
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    return transporter;
}

async function sendEmail({ to, subject, text }) {
    const emailTransporter = getTransporter();

    if (!emailTransporter) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("[EmailService] EMAIL_USER/EMAIL_PASS missing. Skipping email send.");
        }
        return { skipped: true };
    }

    return emailTransporter.sendMail({
        from: `"${appName}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text
    });
}

async function sendWelcomeEmail({ to, username }) {
    return sendEmail({
        to,
        subject: "Welcome to PizzaHub",
        text: `Hello ${username},\nWelcome to PizzaHub! Your account has been successfully created.\nYou can now login and order delicious pizzas.`
    });
}

async function sendLoginOtpEmail({ to, username, otp }) {
    return sendEmail({
        to,
        subject: "PizzaHub Login OTP",
        text: `Hello ${username},\nYour OTP for logging into PizzaHub is:\n\n${otp}\n\nThis OTP will expire in 5 minutes.`
    });
}

module.exports = {
    canSendEmails,
    sendEmail,
    sendWelcomeEmail,
    sendLoginOtpEmail
};
