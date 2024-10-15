// backend/index.js
const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors"); // Import CORS middleware

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

// Set up Nodemailer transport (replace with your email config)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chinmaydesai2005@gmail.com", // Replace with your email
    pass: "lgmu hghf rbnr tmze", // Replace with your email password or app-specific password
  },
});

app.post(
  "/upload",
  upload.fields([{ name: "pdfFiles" }, { name: "csvFile", maxCount: 1 }]),
  (req, res) => {
    const pdfFiles = req.files.pdfFiles;
    const csvFile = req.files.csvFile[0];
    const emailPromises = [];

    fs.createReadStream(csvFile.path)
      .pipe(csv())
      .on("data", (row) => {
        const { Name, Email } = row;
        const pdfFile = pdfFiles.find(
          (file) => path.basename(file.originalname, ".pdf") === Name
        );

        if (pdfFile) {
          // Configure the email
          const mailOptions = {
            from: "your-email@gmail.com", // Replace with your email
            to: Email,
            subject: "Your PDF Document",
            text: `Hi ${Name}, please find your PDF attached.`,
            attachments: [
              {
                filename: pdfFile.originalname,
                path: pdfFile.path,
              },
            ],
          };

          // Send the email
          emailPromises.push(transporter.sendMail(mailOptions));
        }
      })
      .on("end", () => {
        // Wait for all email promises to complete
        Promise.all(emailPromises)
          .then(() => {
            res.status(200).send("Emails sent successfully");
          })
          .catch((error) => {
            console.log("Error sending emails:", error);
            // console.error("Error sending emails:", error);
            res.status(500).send("Error sending emails");
          });
      });
  }
);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
