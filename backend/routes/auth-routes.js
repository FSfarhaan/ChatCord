const express = require('express');
const { check, validationResult } = require('express-validator');
const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const JWT_KEY = "Farhaan Bhaiyya";

// ------------------ Sign up --------------------------
router.post('/signup',
    [
        check('sender').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ message: "Invalid inputs" });

        const { sender, email, password } = req.body;

        let hasUser;
        try {
            hasUser = await UserModel.findOne({ email });
        } catch (err) {
            return res.status(500).json({ message: "Some error occurred" });
        }

        if (hasUser) return res.status(422).json({ message: "User already exists" });

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 12);
        } catch (err) {
            return res.status(500).json({ message: "Some error occurred" });
        }

        const newUser = new UserModel({
            sender, email, password: hashedPassword
        });

        try {
            await newUser.save();
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Some error occurred" });
        }

        let token;
        try {
            token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_KEY, { expiresIn: '1h' });
        } catch (err) {
            return res.status(500).json({ message: "Some error occurred" });
        }

        res.status(201).json({ userId: newUser.id, email: newUser.email, token: token, name: newUser.sender });
    }
);

// ------------------ Login --------------------------
router.post('/login',
    [
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ message: "Invalid inputs" });

        const { email, password } = req.body;

        let hasUser;
        try {
            hasUser = await UserModel.findOne({ email });
        } catch (err) {
            return res.status(500).json({ message: "Some error occurred" });
        }

        if (!hasUser) return res.status(401).json({ message: "No Such User Exists" });

        let isValidPassword = false;
        try {
            isValidPassword = await bcrypt.compare(password, hasUser.password);
        } catch (err) {
            return res.status(500).json({ message: "Some error occurred" });
        }

        if (!isValidPassword) return res.status(401).json({ message: "Invalid credentials" });

        let token;
        try {
            token = jwt.sign({ userId: hasUser.id, email: hasUser.email }, JWT_KEY, { expiresIn: '1h' });
        } catch (err) {
            return res.status(500).json({ message: "Some error occurred" });
        }

        res.json({ userId: hasUser.id, email: hasUser.email, token: token, name: hasUser.sender });
    }
);


module.exports = router;
