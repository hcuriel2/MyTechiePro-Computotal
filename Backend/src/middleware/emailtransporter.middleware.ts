const nodemailer = require("nodemailer");

let emailtransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'noreply.mytechie.pro@gmail.com', // generated ethereal user
      pass: 'BCITpassword', // generated ethereal password
    },
  });

  export default emailtransporter