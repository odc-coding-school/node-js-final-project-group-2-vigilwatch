const express = require("express");
const router = express.Router();
const db = require("../model/db");
const { v4: uuidv4 } = require("uuid");

// GET route for rendering the verification page
router.get("/verification", (req, res) => {
    res.render("verification", { error: null }); // Pass null for error on initial load
});

// POST route for handling verification
router.post("/verification", (req, res) => {
    const { pseudo_name, phone } = req.body;

    // Validate input fields
    if (!pseudo_name || !phone) {
        return res.render("verification", {
            error: "Please provide Pseudo name and phone number",
        });
    }

    // Database query to find user in the auth table
    db.get("SELECT * FROM auth WHERE phone = ? AND pseudo_name = ?", [phone, pseudo_name], (err, authRow) => {
        if (err) {
            console.error("Error:", err);
            return res.status(500).send("Error fetching user");
        }

        if (!authRow) {
            return res.render("verification", {
                error: "User or pseudo name not found",
            }); // Return immediately after rendering
        }

        // Fetch the user details from the users table using the user_id from the auth table
        db.get("SELECT * FROM users WHERE id = ?", [authRow.user_id], (err, userRow) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).send("Error fetching user");
            }

            if (!userRow) {
                return res.render("verification", {
                    error: "Associated user not found",
                });
            }

            // User is verified, set session with both auth and user info
            req.session.verified = {
                pseudo_name: authRow.pseudo_name,
                phone: authRow.phone,
                authID: authRow.id,
                userID: userRow.id,
                full_name: userRow.full_name,
                national_id_number: userRow.national_id_number
            };

            // Redirect to incident reporting page
            return res.redirect("/report-incident");
        });
    });
});

// Handle new reporter registration
router.post("/new-reporter", (req, res) => {
    const { national_id, full_name, phone, pseudo_name } = req.body;

    const userID = uuidv4();

    if (!national_id || !full_name || !phone || !pseudo_name) {
        return res.render("verification", { error: "Please provide all fields" });
    }

    // Insert new user into the database
    db.run(
        "INSERT INTO users (id, national_id_number, full_name) VALUES (?, ?, ?)",
        [userID, national_id, full_name],
        (err) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).send("Error creating user");
            }
            // Insert new auth record
            db.run(
                "INSERT INTO auth (id, pseudo_name, phone, user_id) VALUES (?, ?, ?, ?)",
                [uuidv4(), pseudo_name, phone, userID],
                (err) => {
                    if (err) {
                        console.error("Error:", err);
                        return res.status(500).send("Error creating user");
                    }
                    res.redirect("/verification");
                }
            );
        }
    );
});

module.exports = router;






// const express = require("express");
// const router = express.Router();
// const db = require("../model/db");
// const { v4: uuidv4 } = require("uuid");

// // GET route for rendering the verification page
// router.get("/verification", (req, res) => {
//     res.render("verification", { error: null }); // Pass null for error on initial load
// });

// // POST route for handling verification
// router.post("/verification", (req, res) => {
//     const { pseudo_name, phone } = req.body;

//     // Validate input fields
//     if (!pseudo_name || !phone) {
//         return res.render("verification", {
//             error: "Please provide Pseudo name and phone number",
//         });
//     }

//     // Database query to find user in the auth table
//     db.get("SELECT * FROM auth WHERE phone = ? AND pseudo_name = ?", [phone, pseudo_name], (err, authRow) => {
//         if (err) {
//             console.error("Error:", err);
//             return res.status(500).send("Error fetching user");
//         }

//         if (!authRow) {
//             return res.render("verification", {
//                 error: "User or pseudo name not found",
//             }); // Return immediately after rendering
//         }

//         // Fetch the user details from the users table using the user_id from the auth table
//         db.get("SELECT * FROM users WHERE id = ?", [authRow.user_id], (err, userRow) => {
//             if (err) {
//                 console.error("Error:", err);
//                 return res.status(500).send("Error fetching user");
//             }

//             if (!userRow) {
//                 return res.render("verification", {
//                     error: "Associated user not found",
//                 });
//             }

//             // User is verified, set session with both auth and user info
//             req.session.verified = {
//                 pseudo_name: authRow.pseudo_name,
//                 phone: authRow.phone,
//                 authID: authRow.id,
//                 userID: userRow.id,
//                 full_name: userRow.full_name,
//                 national_id_number: userRow.national_id_number
//             };

//             // Redirect to incident reporting page
//             return res.redirect("/report-incident");
//         });
//     });
// });

//  // Handle new reporter registration
// router.post("/new-reporter", (req, res) => {
//     const { national_id, full_name, phone, pseudo_name } = req.body;

//     const userID = uuidv4();

//     if (!pseudo_name || !phone || !phone.match(/^\+[1-9]\d{1,14}$/)) {
//         return res.render("verification", {
//             error: "Please provide a valid pseudo name and phone number in E.164 format."
//         });
//     }

//     // At this point, the phone number has been verified by Firebase.
//     // Insert new user into the database
//     db.run(
//         "INSERT INTO users (id, national_id_number, full_name) VALUES (?, ?, ?)",
//         [userID, national_id, full_name],
//         (err) => {
//             if (err) {
//                 console.error("Error:", err);
//                 return res.status(500).send("Error creating user");
//             }
//             // Insert new auth record
//             db.run(
//                 "INSERT INTO auth (id, pseudo_name, phone, user_id) VALUES (?, ?, ?, ?)",
//                 [uuidv4(), pseudo_name, phone, userID],
//                 (err) => {
//                     if (err) {
//                         console.error("Error:", err);
//                         return res.status(500).send("Error creating user");
//                     }
//                     res.redirect("/verification", {error: null});
//                 }
//             );
//         }
//     );
// });

// // Route to generate a verification code (Firebase will handle this on the client side)
// router.post('/generate-code', (req, res) => {
//     const { phone } = req.body;

//     // No action needed here, Firebase will handle sending the code on the client side
//     res.json({ success: true });
// });

// module.exports = router;
