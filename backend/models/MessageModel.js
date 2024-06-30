const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
    sender: { type: mongoose.Types.ObjectId, required: true, ref: 'UserModel' },
    name: { type: String, required: true },
    message: { type: String, required: true },
    timeStamp: { type: Date, defauult: Date.now, required: true}
})

module.exports = mongoose.model('MessageSchema', MessageSchema);