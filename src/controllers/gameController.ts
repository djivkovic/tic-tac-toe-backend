import { Request, Response } from 'express';
import * as GameService from '../services/gameService';

export const createGame = async (req: Request, res: Response) => {
    try {
        const { gameType } = req.body;
        const result = await GameService.createGame(gameType);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const addMoveToGame = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);
        const userId = req.body.userId;
        const move = req.body.move;

        const updatedGame = await GameService.addMoveToGame(gameId, userId, move);
        res.status(200).json(updatedGame);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMovesByGameId = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);

        const moves = await GameService.getMovesByGameId(gameId);
        res.status(200).json(moves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const assignPlayer = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);
        const { userId, sign } = req.body;

        const updatedGame = await GameService.assignPlayer(gameId, userId, sign);
        res.status(200).json(updatedGame);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
export const getPlayerSymbol = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);
        const userId = req.params.userId;

        const playerSymbol = await GameService.getPlayerSymbol(gameId, userId);
        res.status(200).json({ symbol: playerSymbol });
    } catch (err) {
        res.status(500).json({ error: err });
    }
};

export const findGameById = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);
        const game = await GameService.findGameById(gameId);

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.status(200).json({ found: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
