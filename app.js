require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./db/connect");
const File = require("./models/File");
const fs = require("fs");
const rateLimit = require('express-rate-limit');
const nosqlSanitizer = require('express-nosql-sanitizer');
const { xss } = require('express-xss-sanitizer');
const app = express();
const { uploadFileToAzure } = require("./controllers/azureUpload");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());

const sendEmailGmail = require("./controllers/sendGmail");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

app.use(nosqlSanitizer());

app.use(limiter)


app.use(cors({
  exposedHeaders: ['Content-Disposition']
}));
app.use(fileUpload());


app.post("/", async (req, res) => {

  if (!req.files || !req.files.encryptedFile) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const file = req.files.encryptedFile;
  const originalName = req.body.originalName;
  const receiverEmail = req.body.receiverEmail;
  const password = req.body.password;


  try {
    const azureUploadResponse = await uploadFileToAzure(file);
    const fileId = uuidv4();
    const downloadLink = azureUploadResponse.link;

    const newFile = new File({
      fileName: azureUploadResponse.filename,
      originalName: originalName,
      downloadLink: downloadLink,
      extension: path.extname(originalName),
      password: password,
      path: downloadLink,
      fileId: fileId
    });
    await newFile.save();


    if (receiverEmail) {
      try {
        await sendEmailGmail(receiverEmail, fileId);
        console.log("mail sent");
      } catch (error) {
        console.log("Error sending email:", error);

        return res.status(500).json({ msg: "Error sending email", error: error.message });
      }
    }


    res
      .status(200)
      .json({ msg: "File uploaded successfully", link: downloadLink });
  } catch (err) {
    res
      .status(500)
      .send({ msg: "Error while uploading file", error: err.message });
  }
});


app.get("/download/:id", async (req, res) => {
  try {
    const file = await File.findOne({
      fileId: req.params.id,
    });


    const password = req.headers['password'];

    if (!file || !file.path || file.password !== password) {
      return res.status(403).send({ msg: "Access denied" });
    }

    const filename = file.originalName || "downloaded_file";
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    res.download(file.path, filename, async (err) => {
      if (!err) {

        await File.deleteOne({ _id: file._id });

        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error:", unlinkErr);
          } else {
            console.log("Error failed.");
          }
        });
      }
    });
  } catch (err) {
    res.status(500).send({ msg: "Error retrieving file", error: err.message });
  }
});


app.post("/send", express.json(), async (req, res) => {

  const { receiverEmail, fileId, senderName } = req.query;
  try {
    await sendEmailGmail(receiverEmail, fileId, senderName);
    res.status(200).json({ msg: "Email sent successfully-2" });
  } catch (error) {
    console.log("Error sending email:", error);
    res.status(500).json({ error: error.message });
  }
});


const port = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log("Server is listening on port " + port);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
