// Landing page route (routes/home.js)
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Home route
router.get('/', (req, res) => {
    res.render('Index');
});

router.post('/', (req, res)=>{
    const { name, email, address, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',  
        auth: {
             user: 'astainyharris1@gmail.com',  // Your email address
            pass: 'ylrq jqqt zduj ayul'   // Your email password (use app-specific password for Gmail)
        }
    });

    // Compose email
    const mailOptions = {
        from: `${name} <${email}>`, 
        to: `astainyharris1@gmail.com`,  
        subject: 'New Contact Form Submission',
        text: `You have a new message from ${name}:
        
        Email: ${email}
        Address: ${address}
        
        Message:
        ${message}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending message');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Message sent successfully');
            // Redirect user back to homepage

            res.send(`
                <html>
                    <head>
                        <title>Message Sent</title>
                        <script>
                            setTimeout(function() {
                                window.location.href = "/";
                            }, 480000);
                        </script>
                    </head>
                    <body>
                        <h1>Thank you for contacting us!</h1>
                        <p>We'll will get reply you very shortly.</p>
                        <small>You will be redirected to the homepage in 5 seconds.</small>
                    </body>
                </html>
            `);
        }
    });

    res.redirect('/')
})

module.exports = router;
