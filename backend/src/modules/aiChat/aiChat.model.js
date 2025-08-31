const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
        },
    message: String,
    response: String,
    type: { type: String, default: 'general' }, // 'progress', 'practice', etc.
},{
    timestamps:true,
    autoIndex:true,
    autoCreate:true,
})

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
