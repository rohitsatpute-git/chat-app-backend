import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import cors from 'cors'
import authRoute from './src/route/loginRoute.js'
import userRoute from './src/route/userRoute.js'
import messageRoute from './src/route/messageRoute.js'
import { Server } from 'socket.io';
import http from 'http'
import Message from './src/models/message.js';
import User from './src/models/user.js';
import { ObjectId } from 'mongodb';
import initSocket from './src/socket/socket.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/', messageRoute)

const server = http.createServer(app)

initSocket(server);

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('connect to db....')
    } catch(err) {
        console.log("error connecting db", err)
    }
}
connectDB()

app.get('/', (req, res) => {
    res.status(200).send('working')
})


server.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port `, process.env.PORT);
})