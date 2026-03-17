import { io } from "socket.io-client";

const socketUrl = (process.env.VITE_SOCKET_URL || "http://localhost:5000").replace(/\/+$/, "");


const socket = io(socketUrl, {
  autoConnect: false,
});

export default socket;

