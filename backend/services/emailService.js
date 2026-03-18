function canSendEmails() {
    return Boolean(process.env.BREVO_API_KEY && process.env.EMAIL_FROM);
}

function isValidEmail(email) {
    if (typeof email !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function sendEmail({ to, subject, text }) {
    if (!canSendEmails()) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("[EmailService] BREVO_API_KEY/EMAIL_FROM missing. Skipping email send.");
        }
        return { skipped: true };
    }

    if (!isValidEmail(to)) {
        throw new Error("Invalid recipient email format");
    }

    const [fromName, fromEmail] = process.env.EMAIL_FROM.includes("<")
        ? [
            process.env.EMAIL_FROM.split("<")[0].trim().replace(/^"|"$/g, ""),
            process.env.EMAIL_FROM.split("<")[1].replace(">", "").trim()
        ]
        : ["PizzaHub", process.env.EMAIL_FROM.trim()];

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
            sender: {
                name: fromName || "PizzaHub",
                email: fromEmail
            },
            to: [{ email: to }],
            subject,
            textContent: text
        })
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Brevo API error (${response.status}): ${details}`);
    }

    return response.json();
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

async function sendPasswordResetEmail({ to, username, resetLink }) {
    return sendEmail({
        to,
        subject: "PizzaHub Password Reset",
        text: `Hello ${username},\nWe received a request to reset your PizzaHub password.\n\nReset your password using this link:\n${resetLink}\n\nThis link will expire in 15 minutes.\nIf you did not request this, please ignore this email.`
    });
}

module.exports = {
    canSendEmails,
    sendEmail,
    sendWelcomeEmail,
    sendLoginOtpEmail,
    sendPasswordResetEmail
};
