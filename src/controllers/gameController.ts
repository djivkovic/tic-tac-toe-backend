import { Request, Response } from 'express';
import * as GameService from '../services/gameService';
export const createGame = async (req: Request, res: Response) => {
    try {
        const { gameType } = req.body;
        const result = await GameService.createGame(gameType);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
