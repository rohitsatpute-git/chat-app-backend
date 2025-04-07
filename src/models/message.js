import mongoose from "mongoose";
import User from "./user.js";

const messageSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Types.ObjectId,
        ref: User
    },
    receiver_id: {
        type: mongoose.Types.ObjectId,
        ref: User
    },
    content: {
        type: String,
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    imageUrl: {
        type: String
    }

}, { timestamps: true });

const Message = mongoose.model('messages', messageSchema);

export default Message;