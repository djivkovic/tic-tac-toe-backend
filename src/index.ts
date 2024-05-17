import { Request, Response } from "express";
import express from "express";
import cors from "cors";
import * as bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import "../db/config";
import UserModel from "../db/User";
import {GameModel, generateGameId} from "../db/Game";
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
// function verifyToken(socket, next) {
//     const token = socket.handshake.query.token;
//     console.log(token);
//     try {
//         if (token) {
//             const decoded =  jwt.verify(token, jwtKey);
//             console.log("Token verified successfully");
//             socket.user = decoded;
//             next();
//         } else {
//             console.log("No token provided");
//             next(new Error('Authentication error'));
//         }
//     } catch (err) {
//         console.log("Error verifying token:", err.message);
//         next(new Error('Authentication error'));
//     }
// }

// io.use(verifyToken);

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

    socket.on("join_room", async (room) => {
        const socketsInRoom = await io.in(room).fetchSockets();
        if(socketsInRoom.length === 2){
            console.log("Max 2 soketa po sobi");
            return;
        }else{
            socket.join(room);
            const socketsInRoom = await io.in(room).fetchSockets();
            console.log(`Broj soketa u sobi:${room} `, socketsInRoom.length);
            console.log("Soketi u sobi", room, socketsInRoom.map(socket => socket.id));
        }
    });

    socket.on("leave_room", async (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} has left room ${room}`);
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

        jwt.sign({ username: newUser.username }, jwtKey, { expiresIn: "2h" }, (err, token) => {
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

        jwt.sign({ username: user.username }, jwtKey, { expiresIn: "2h" }, (err, token) => {
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

        const newGame = new GameModel({
            gameId,
            gameType: req.body.gameType,
            moves: req.body.moves,
            winner: req.body.winner
        });

        await newGame.save();

        res.status(200).json({ message: "Game created successfully", game: newGame });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});
