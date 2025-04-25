import Message from "../models/message.js";
import { ObjectId } from "mongodb";
import dotenv from 'dotenv'
import AWS from 'aws-sdk'

dotenv.config();
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY
    }
});


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

export const getSignedUrlForDownload = async(req, res) => {
    try {
        const { filename } = req.body;
        console.log("fileame", filename)
        const params = {
            Bucket: 'mychat-app-images',
            Key: filename,
            Expires: 20,
        }

        const singedUrl = s3.getSignedUrl('getObject', params);

        console.log("signedurl", singedUrl);

        res.status(200).send({url: singedUrl});

    } catch (err){
        console.log("error getting signed data", err);
        res.status(500).send({err});
    }
}


export const getSignedUrlForUpload = async(req, res) => {
    try {
        const { filename, fileType } = req.body;
        console.log("fileame", filename, req.body)
        const params = {
            Bucket: 'mychat-app-images',
            Key: filename,
            Expires: 300,
            ContentType: fileType
        }

        const singedUrl = s3.getSignedUrl('putObject', params);

        console.log("signedurl", singedUrl);

        res.status(200).send({url: singedUrl});

    } catch (err){
        console.log("error getting signed data", err);
        res.status(500).send({err});
    }
}

