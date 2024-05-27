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

        if (isNaN(gameId) || !userId || !move) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const updatedGame = await GameService.addMoveToGame(gameId, userId, move);
        res.status(200).json(updatedGame);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMovesByGameId = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);

        if (isNaN(gameId)) {
            return res.status(400).json({ error: 'Invalid gameId' });
        }

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

        if (isNaN(gameId) || !userId || !sign) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const updatedGame = await GameService.assignPlayer(gameId, userId, sign);
        res.status(200).json(updatedGame);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPlayerSymbol = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);
        const userId = req.params.userId;

        if (isNaN(gameId) || !userId) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const playerSymbol = await GameService.getPlayerSymbol(gameId, userId);
        res.status(200).json({ symbol: playerSymbol });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const findGameHistoryById = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);

        if (isNaN(gameId)) {
            return res.status(400).json({ error: 'Invalid gameId' });
        }

        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const game = await GameService.findGameById(gameId);

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        if (game.winner === null) {
            return res.status(403).json({ error: 'Game is not finished yet' });
        }

        if (!game.players.includes(userId)) {
            return res.status(403).json({ error: 'User was not part of this game' });
        }

        res.status(200).json({ found: true, game });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const findGame = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);

        if (isNaN(gameId)) {
            return res.status(400).json({ error: 'Invalid gameId' });
        }

        const game = await GameService.findGameById(gameId);

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.status(200).json({ found: true, game });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPlayersUsername = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);

        const players = await GameService.getPlayersInGame(gameId);
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get players in game!' });
    }
};

export const getWinnerByGameId = async (req: Request, res: Response) => {
    try {
        const gameId = parseInt(req.params.gameId, 10);

        if (isNaN(gameId)) {
            return res.status(400).json({ error: 'Invalid gameId' });
        }

        const game = await GameService.findGameById(gameId);

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        const winner = game.winner;
        res.status(200).json({ winner });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
