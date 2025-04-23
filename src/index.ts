import express, { Request, Response } from 'express';
import { json } from 'body-parser';
import authRoutes from './routes/authRoutes';
import pool from './models/db'; // <-- Make sure this is imported to access the database
import conversationsRoutes from './routes/conversationRoutes';
import messagesRoutes from './routes/messagesRoutes'
import http from 'http';
import { Server } from "socket.io";
import { saveMessage } from './controllers/messagesController';


const app = express();
const server = http.createServer(app);
app.use(json());
const io = new Server(server,{
  cors:{
        origin:'*'
  }


})

// Register auth routes
app.use('/auth', authRoutes);
app.use('/conversation',conversationsRoutes);
app.use('/messages',messagesRoutes)

io.on('connection',(socket)=>{
  console.log ('A user connected:',socket.id); 

  socket.on('jointConversation',(conversationId) =>{
    socket.join(conversationId);
    console.log('User joined conversation :'+conversationId);
  })
socket.on('sendMessage', async (message)=>{
  const {conversationId,senderId,content}=message;

  try{
const savedMessage = await saveMessage(conversationId,senderId,content);
console.log("sendMessage:");
console.log(savedMessage);
io.to(conversationId).emit('newmessage',saveMessage);


io.emit('conversationUpdated',{
  conversationId,
  lastMessage:savedMessage.content,
  lastMessageTime: savedMessage.created_at,
});
  }catch(err){
    console.error('Failed to save message:',err);
  }
});

socket.on('disconnect',()=>{
  console.log('User disconnected:',socket.id);

})

})

// Test DB connection route
app.get('/test-db', async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT NOW()');
      res.json(result.rows);
    } catch (error) {
      console.error('DB test failed:', error); // Already here, good
      res.status(500).json({ message: 'DB connection failed', error });
    }
  });
  

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
