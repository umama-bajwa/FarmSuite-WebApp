const express = require("express");
const { body, validationResult } = require("express-validator");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name")
      .trim()
      .notEmpty().withMessage("Name is required")
      .isAlpha('en-US', { ignore: ' ' }).withMessage("Name should only contain alphabets"),

    body("username")
      .trim()
      .notEmpty().withMessage("Username is required")
      .matches(/^[a-z0-9]+$/).withMessage("Username must only contain lowercase letters and digits"),

    body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 4, max: 6 }).withMessage("Password must be between 4 and 6 characters long")
      .matches(/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
      .withMessage("Password contains invalid characters"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    // Continue with signup logic
    return res.status(200).json({ message: "User registered successfully" });
  }
);

module.exports = router;
