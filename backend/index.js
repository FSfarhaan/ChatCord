const express = require('express');
const { socketIo, Server } = require('socket.io');
const { http, createServer } = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth-routes');
const messageRoutes = require('./routes/message-routes');
const MONGO_URL = "mongodb+srv://farhaan8d:m8fs2f7s6@cluster0.tl8lett.mongodb.net/iChatRoom?retryWrites=true&w=majority&appName=Cluster0"
const cors = require('cors');
const MessageModel = require('./models/MessageModel');
const PORT = 5000;

const app = express();
const server = createServer(app);

app.use(bodyParser.json())
app.use(cors())

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true
    }
} )


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
})

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

app.use((req, res, next) => {
    return res.status(401).json({message: "Could not find this route"});
})

app.use((error, req, res, next) => {
    if(res.headerSent) return next(error);

    res.status(error.code || 500).json({message: error.message || "An unknown error occurred"})
})

mongoose.connect(MONGO_URL).then(() =>{
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
        console.log("Connected to mongodb");
    })
}).catch(err => console.log(err))


io.on('connection', (socket) => {   

    socket.on('send-message', (message)=> {
        io.emit('receive-message', message);
    })

    socket.on('delete-message', (messageId) => {
        io.emit('message-deleted', messageId);
    })

    socket.on('edit-message', (messageId, newMessage) => {
        io.emit('message-edited', messageId, newMessage);
    })
})
