const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true },
    user: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    is_hateful: { type: Boolean, required: true }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
