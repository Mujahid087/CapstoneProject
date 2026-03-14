import { io } from "socket.io-client";

// Singleton socket instance — created once, reused everywhere.
// This prevents duplicate connections when components re-render.
const socket = io("http://localhost:5000", {
    autoConnect: false, // Connect manually so we can control timing
});

export default socket;
