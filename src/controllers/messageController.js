import Message from "../models/message.js";
import { ObjectId } from "mongodb";

export const getAllMessages = async(req, res) => {
    try {

        const userId = new ObjectId(String(req.query.userId));
        const receiverId = new ObjectId(String(req.params.receiver));

        const allMessagesBetweenThem = await Message.find({ $or: [ 
            { sender_id: userId, receiver_id: receiverId },
            { sender_id: receiverId, receiver_id: userId }
        ] });

        res.status(200).send(allMessagesBetweenThem);

    } catch (err) {
        console.log('error fetching all messages');
        res.status(500).send({err});
    }
}