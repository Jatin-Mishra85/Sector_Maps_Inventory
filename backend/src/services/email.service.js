const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

const ADMIN_EMAILS = [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2].filter(Boolean);

// Report submit hone par admins ko notify karta hai.
// Agar mail bhejne mein koi issue ho, to sirf log karo — report save to ho hi chuka
// hoga DB mein, isliye request ko fail nahi karna.
async function sendReportNotification({ inventoryId, reason, details, reportedByUserId }) {
    if (ADMIN_EMAILS.length === 0) return;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: ADMIN_EMAILS.join(','),
            subject: `New Report — Inventory #${inventoryId}`,
            text:
                `A new report has been submitted.\n\n` +
                `Inventory ID: ${inventoryId}\n` +
                `Reported by (User ID): ${reportedByUserId}\n` +
                `Reason: ${reason}\n` +
                `Details: ${details}\n`,
        });
    } catch (err) {
        console.error('Failed to send report notification email:', err.message);
    }
}

module.exports = {
    sendReportNotification,
};