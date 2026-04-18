const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- 1. NEW: Import HTTP and Socket.IO ---
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(
  cors({
    origin:["https://ayurconnect-one.vercel.app",
      "http://localhost:3000"
    ], 
    credentials: true,
    
  })
);
app.use(express.json());

// --- 2. IMPORT ROUTES ---
const diseaseRoutes = require('./routes/diseaseRoutes');
const publicApiRoutes = require('./routes/publicApiRoutes');
const authRoutes = require('./routes/authRoutes'); // Doctor Login/Signup
const patientRoutes = require('./routes/patientRoutes'); // Patient Management
const doctorRoutes = require('./routes/doctorRoutes'); // Doctor Profile
const Message = require('./models/Message');
// --- 3. CONTROLLERS ---
const developerController = require('./controllers/developerController');
const auth = require('./middleware/auth');

// --- 4. APPLY ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);

app.post('/api/developers/generate-key', developerController.generateApiKey);
app.use('/api/v1', publicApiRoutes);

// --- 5. MONGODB CONNECTION ---

app.post('/api/messages/mark-read', auth, async (req, res) => {
  try {
    const { room, userRole } = req.body;
    
    // If user is Doctor, mark Patient messages as read. Vice versa.
    const senderRoleToMark = userRole === 'patient' ? 'Doctor' : 'Patient';

    await Message.updateMany(
      { room: room, senderRole: senderRoleToMark, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ msg: "Messages marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// --- 6. WEBSOCKET (SOCKET.IO) SETUP ---
// Wrap the Express app with an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS for React
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Make sure this matches your frontend port
    methods: ["GET", "POST"]
  }
});

// Real-time Chat Logic
io.on("connection", (socket) => {
  console.log(`🔌 User Connected: ${socket.id}`);

  // 1. JOIN ROOM & LOAD HISTORY
  socket.on("join_room", async (patientId) => {
    socket.join(patientId);
    console.log(`🚪 User joined room: ${patientId}`);

    try {
      // Fetch all previous messages for this room, sorted by oldest first
      const chatHistory = await Message.find({ room: patientId }).sort({ timestamp: 1 });
      
      // Send the history ONLY to the user who just joined
      socket.emit("load_history", chatHistory);
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  });

  // 2. RECEIVE MESSAGE & SAVE TO DB
  socket.on("send_message", async (data) => {
    try {
      // Save to MongoDB
      const newMessage = new Message({
        room: data.room,
        senderRole: data.senderRole,
        senderName: data.senderName,
        text: data.text,
        time: data.time
      });
      await newMessage.save();

      // Broadcast to everyone ELSE in the room
      socket.to(data.room).emit("receive_message", data);
      socket.broadcast.emit("global_notification", data);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🛑 User Disconnected: ${socket.id}`);
  });
});
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ NAMC Database Connected'))
  .catch((err) => console.error('❌ Database Connection Error:', err));

// --- 7. START SERVER ---
// CRITICAL: We must use server.listen() instead of app.listen() for WebSockets to work!
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running with WebSockets on port ${PORT}`));