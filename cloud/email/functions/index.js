const functions = require("firebase-functions");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post("/sendEmail", function(req, res, next) {
  const params = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "admin@goshare360.com",
      pass: "GSdev!007",
    },
  });

  const mailOptions = {
    from: "GoShare360 Admin",
    to: params.email,
    subject: "The following is reset password link",
    text: "https://goshare360.web.app/reset-password/" + params.hash,
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      res.json({success: 0, msg: "Email not sent"});
    } else {
      res.json({success: 1, msg: "Email sent"});
    }
  });
});

app.listen(port, () => console.log("Email function listening on port:" + port));

exports.email = functions.https.onRequest(app);
