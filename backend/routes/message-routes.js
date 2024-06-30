const express = require('express');
const { check, validationResult } = require('express-validator');
const MessageModel = require('../models/MessageModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const router = express.Router();

const JWT_KEY = "Farhaan Bhaiyya";

// ------------------ Get all Messages --------------------------
router.get('/getmessages', async (req, res) => {
    let messages;
    try {
        messages = await MessageModel.find();
    } catch (err) {return res.status(500).json({message: "Some error ocurred"})} 

    res.json({ messages: messages.map(message => message.toObject({ getters: true })) });
})

// ------------------ Create new Message --------------------------
router.post('/createmessage',
    [check('message').not().isEmpty(), check('name').not().isEmpty(), check('sender').not().isEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ message: "Invalid inputs" });
        }

        const { sender, name, message, timeStamp } = req.body;

        // Ensure sender is valid
        if (!mongoose.Types.ObjectId.isValid(sender)) {
            return res.status(422).json({ message: "Invalid sender ID" });
        }

        const newMessage = new MessageModel({
            sender, name, message, timeStamp
        });

        let createdMessage;
        try {
            createdMessage = await newMessage.save();
        } catch (err) {
            return res.status(500).json({ message: "Some error occurred" });
        }

        res.status(200).json({ createdMessage });
    });


// ------------------ Update Message --------------------------
router.patch('/updatemessage/:mid',
    [check('message').not().isEmpty()], 
    async (req, res) =>{
        const error = validationResult(req);
        if(!error) return res.status(422).json({message: "Invalid inputs"})

        const messageId = req.params.mid;

        const { message } = req.body;

        let createdMessage;
        try {
            createdMessage = await MessageModel.findById(messageId)
        } catch (err) {return res.status(500).json({message: "Some error ocurred"})} 

        // if(createdMessage.sender.toString())

        if(!createdMessage) return res.status(404).json({message: "No such message exists"})

        createdMessage.message = message;

        try {
            await createdMessage.save();
        } catch (err) {return res.status(500).json({message: "Some error ocurred"})} 

        res.status(201).json({createdMessage});

})

// ------------------ Delete Message --------------------------
router.delete('/deletemessage/:mid', async (req, res) => {
    const messageId = req.params.mid;
    
    let message;
    try {
        message = await MessageModel.findById(messageId);
    } catch (err) { return res.status(422).json({message: "Some error ocurred"})} 

    if(!message) return res.status(404).json({message: "No such message exists"})

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await message.deleteOne({ session: sess });
        await sess.commitTransaction();
    } catch (err) { return res.status(500).json({message: "Some error ocurred"})} 

    res.status(200).json({message: "Kar diya delete"});
}) 

module.exports = router;