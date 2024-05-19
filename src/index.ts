import { Request, Response } from "express";
import express from "express";
import cors from "cors";
import * as bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import "../db/config";
import UserModel from "../db/User";
import { GameModel, generateGameId } from "../db/Game";
import http from 'http';
import { Server } from "socket.io";

const jwtKey = 'tictactoe';
const app = express();

app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("send_message", (data) => {
        if (data.room) {
            socket.to(data.room).emit("receive_message", data);
        } else {
            io.emit("receive_message", data);
        }
        console.log(data);
    });
    socket.on("join_room", async (data) => {
        const { room, userId, username } = data;
    
        if (!room || isNaN(room)) {
            console.error(`Invalid room value: ${room}`);
            socket.emit("join_room_response", { success: false, message: "Invalid room value" });
            return;
        }
    
        const roomNumber = parseInt(room, 10);
    
        try {
            const game = await GameModel.findOne({ gameId: roomNumber });
            if (game) {
                const socketsInRoom = await io.in(room).fetchSockets();
    
                if (socketsInRoom.length >= 2) {
                    console.log("Room is full!");
                    socket.emit("join_room_response", { success: false, message: "Room is full!" });
                    return;
                }
    
                if (game.players.length === 2 && !game.players.includes(userId)) {
                    console.log("Max 2 players per game. Only existing players can rejoin.");
                    socket.emit("join_room_response", { success: false, message: "Max 2 players per game. Only existing players can rejoin." });
                    return;
                }
    
                if (!game.players.includes(userId)) {
                    game.players.push(userId);
                    await game.save();
                    console.log(`User ${userId} added to game ${room}`);
                } else {
                    console.log(`User ${userId} is already in the game ${room}`);
                }
    
                socket.join(room);
                console.log(`User ${socket.id} has joined room ${room}`);
    
                const players = await UserModel.find({ _id: { $in: game.players } }, 'username');
                const playerUsernames = players.map(player => player.username);
    
                io.to(room).emit("update_players", { players: playerUsernames });
                socket.emit("join_room_response", { success: true, message: `User ${userId} joined room ${room}`, username });
            } else {
                console.log(`Game ${room} not found`);
                socket.emit("join_room_response", { success: false, message: "Game not found" });
            }
        } catch (error) {
            console.error(`Error handling join_room for game ${room}:`, error);
            socket.emit("join_room_response", { success: false, message: "Server error" });
        }
    });

    socket.on("leave_room", async (room) => {
        const socketsInRoom = await io.in(room).fetchSockets();
        socket.leave(room);
        console.log(`User ${socket.id} has left room ${room}`);
        console.log("Sockets in room ", room, socketsInRoom.map(socket => socket.id));
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

app.post("/register", async (req: Request, res: Response) => {
    try {
        const existingUser = await UserModel.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists!" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const newUser = new UserModel({
            username: req.body.username,
            password: hashedPassword
        });

        await newUser.save();

        const payload = { id: newUser._id, username: newUser.username };
        
        jwt.sign(payload, jwtKey, { expiresIn: "2h" }, (err, token) => {
            if (err) {
                return res.status(500).json({ error: "Something went wrong..." });
            }
            res.status(200).json({ user: newUser, auth: token });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.post("/login", async (req: Request, res: Response) => {
    try {
        const user = await UserModel.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).json({ error: "User not found!" });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: "Incorrect password!" });
        }

        const payload = { id: user._id, username: user.username };
        
        jwt.sign(payload, jwtKey, { expiresIn: "2h" }, (err, token) => {
            if (err) {
                return res.status(500).json({ error: "Something went wrong..." });
            }
            res.status(200).json({ user, auth: token });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.post("/create-game", async (req: Request, res: Response) => {
    try {
        const gameId = await generateGameId();
        const gameType = req.body['gameType'];

        const newGame = new GameModel({
            gameId,
            gameType,
            players: [],
            moves: [],
            winner: null
        });

        await newGame.save();

        res.status(201).json({ gameId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});
