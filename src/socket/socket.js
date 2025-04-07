import { Server } from "socket.io"
import User from "../models/user.js"
import Message from "../models/message.js"
import { ObjectId } from "mongodb"
import { S3Client, PutObjectCommand, } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY
    }
})


const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST']
        },
        transports: ['websocket']
    })

    io.on('connection', async(socket) => {

        const userId = socket.handshake.query.userId;
        console.log("Connected user ID:", userId, socket.id);
    
        io.emit('updateUsers', userId, socket.id)
    
        await User.findByIdAndUpdate(userId, { $set: { socketId: socket.id } })
    
        socket.on('sendMessage', async(receiverId, receiverSocketId, message, image) => {
            try{
                console.log('first', receiverId, receiverSocketId, message)
                console.log("message", message)
                let imageUrl = ''
                if(image) {
                    const fileName = `${Date.now()}_${image.name}`;
                    const params = {
                        Bucket: 'mychat-app-images',
                        Key: fileName,
                        Body: Buffer.from(image.buffer, 'base64'),
                        ContentType: 'image/jpeg'
                    }

                    const command = new PutObjectCommand(params);
                    await s3.send(command);    
                    imageUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
                    console.log('File uploaded successfully.');
                }
                if(receiverSocketId) {
                    socket.to(receiverSocketId).emit('receiveMessage', message, userId, imageUrl);
                }
                socket.emit('receiverMessageResponse', message, imageUrl)
                await Message.insertOne({ sender_id:  new ObjectId(String(userId)), receiver_id: new ObjectId(String(receiverId)), content: message, status: receiverSocketId ? 'delivered' : 'sent', imageUrl })
            }
            catch(err) {
                console.log('something went wrong while sending message', err)
            }
        })
    
        socket.on('disconnect', async() => {
            console.log('Disconnected user Id', userId, socket.id)
            const updatedUser = await User.findOneAndUpdate({ socketId: socket.id }, { $unset: { socketId: '' } }, { new: true });
            io.emit('updateUsers', updatedUser?._id, undefined)
        })
        
    })
    return io    
}

export default initSocket;