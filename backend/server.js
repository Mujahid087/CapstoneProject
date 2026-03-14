require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);

// Keep IO globally accessible for controllers
const io = new Server(server, {
    cors: {
        origin: "*", // allow frontend access
        methods: ["GET", "POST"]
    }
});

app.set('io', io); // Inject io into req.app

io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client Connected: ${socket.id}`);
    
    // Allow clients to join their specific user room
    socket.on("join_room", (userId) => {
        socket.join(userId);
        console.log(`[Socket.IO] socket ${socket.id} joined room ${userId}`);
    });

    // Admin specific room
    socket.on("join_admin_room", () => {
        socket.join("admin_room");
        console.log(`[Socket.IO] socket ${socket.id} joined admin_room`);
    });

    socket.on("disconnect", () => {
        console.log(`[Socket.IO] Client Disconnected: ${socket.id}`);
    });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Connect MongoDB
connectDB();


// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);


// Test Route
app.get("/", (req, res) => {
    res.send("Food Ordering API Running");
});


// Server Port
const PORT = process.env.PORT || 5000;


// Start Server only when run directly (not when imported by tests)
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;