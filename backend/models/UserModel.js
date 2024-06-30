const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const UserSchema = new Schema({
    sender: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true}
})

UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('UserModel', UserSchema)