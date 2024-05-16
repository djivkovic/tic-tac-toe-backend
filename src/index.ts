import { Request, Response } from "express";
import express from "express";
import cors from "cors";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import "../db/config";
import UserModel from "../db/User";
import {GameModel, generateGameId} from "../db/Game";

const jwtKey = 'tictactoe';
const app = express();

app.use(express.json());
app.use(cors());

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


app.listen(5000, () => {
    console.log("Server running on port 5000");
});
