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
export const addMoveToGame = async (req: Request, res: Response) => {
    try{
        const gameId = parseInt(req.params.gameId);    
        const move = req.body.move;  

        const updatedGame = await GameService.addMoveToGame(gameId, move);
        res.status(200).json(updatedGame);
    }catch (err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const getMovesByGameId = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId);
        const moves = await GameService.getMovesByGameId(gameId);
        res.status(200).json(moves);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
