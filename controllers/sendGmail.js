const nodemailer = require("nodemailer");
const Mail = require("nodemailer/lib/mailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

const sendEmailGmail = async (receiverEmail, fileID, senderName = "Secured Storage") => {
    const mailOptions = {
        from: {
            name: senderName,
            address: process.env.USER
        },
        to: receiverEmail, // Receiver's email address
        subject: "Here is your File ID!", // Subject line
        text: `Dear user, here is your File ID: ${fileID}`, // Plain text body
        html: `<h3>Dear user,</h3><br/> Download page: <a href='http://localhost:5173/download'>download page link</a> <br />Here is your File ID: <strong>${fileID}</strong><br /><br /><b>Because of our security policy we don't share passwords. You need to ask the sender for it.</b>` // HTML body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info);
        return { success: true, data: info };
    } catch (error) {
        console.log("Email sending error:", error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmailGmail;
