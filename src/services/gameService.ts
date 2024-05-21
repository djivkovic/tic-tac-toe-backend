import { GameModel, generateGameId } from '../db/Game';
import UserModel from '../db/User';
import { Move } from '../db/Game';
import * as Socket from '../socket';

export const createGame = async (gameType: string) => {
    try {
        const gameId = await generateGameId();
        const newGame = new GameModel({
            gameId,
            gameType,
            players: [],
            moves: [],
            winner: null,
            playerSymbols: []
        });

        await newGame.save();

        return { gameId };
    } catch (error) {
        console.error('Error creating game:', error);
        throw new Error('Failed to create game!');
    }
};

export const findGameById = async (gameId: number) => {
    try {
        return await GameModel.findOne({ gameId });
    } catch (error) {
        console.error('Error finding game by ID:', error);
        throw new Error('Failed to find game by ID!');
    }
};

export const addPlayerToGame = async (gameId: number, userId: string) => {
    try {
        const game = await GameModel.findOne({ gameId });
        if (!game) {
            throw new Error('Game not found');
        }

        if (!game.players.includes(userId)) {
            game.players.push(userId);
            await game.save();
        }

        return game;
    } catch (error) {
        console.error('Error adding player to game:', error);
        throw new Error('Failed to add player to game!');
    }
};

export const getPlayersInGame = async (gameId: number) => {
    try {
        const game = await findGameById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        return await UserModel.find({ _id: { $in: game.players } }, 'username');
    } catch (error) {
        console.error('Error getting players in game:', error);
        throw new Error('Failed to get players in game!');
    }
};

export const assignPlayer = async (gameId: number, userId: string, sign: string) => {
    try {
        const game = await findGameById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        if (sign !== 'X' && sign !== 'O') {
            throw new Error('Invalid sign');
        }

        const playerWithSymbol = game.playerSymbols.find(ps => ps.playerId === userId);
        if (playerWithSymbol) {
            throw new Error(`Player ${userId} already has a symbol assigned`);
        }

        const assignedSigns = game.playerSymbols.map(ps => ps.symbol);
        if (assignedSigns.includes(sign)) {
            throw new Error(`Sign ${sign} is already taken`);
        }

        game.playerSymbols.push({ playerId: userId, symbol: sign });
        await game.save();

        return game;
    } catch (error) {
        console.error('Error assigning player symbol:', error);
        throw new Error('Failed to assign player symbol!');
    }
};

export const addMoveToGame = async (gameId: number, userId: string, move: Move) => {
    try {
        const game = await findGameById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        const existingMove = game.moves.find(m => m.index.x === move.index.x && m.index.y === move.index.y);

        if (existingMove) {
            console.log(`Move (${move.index.x}, ${move.index.y}) already exists!`);
            return game; 
        }

        game.moves.push(move);
        await game.save();

        Socket.emitMoves(gameId, move);

        return game;
    } catch (error) {
        console.error('Error adding move to game:', error);
        throw new Error('Failed to add move to game!');
    }
};

export const getMovesByGameId = async (gameId: number) => {
    try {
        const game = await findGameById(gameId);

        if (!game) {
            throw new Error('Game not found');
        }

        return game.moves;
    } catch (error) {
        console.error('Error getting moves by gameId:', error);
        throw new Error('Failed to get moves by gameId!');
    }
};

export const getPlayerSymbol = async (gameId: number, userId: string) => {
    try {
        const game = await findGameById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        const playerSymbol = game.playerSymbols.find(ps => ps.playerId === userId);
        if (!playerSymbol) {
            throw new Error('Player has not been assigned a symbol');
        }

        return playerSymbol.symbol;
    } catch (error) {
        console.error('Error getting player symbol:', error);
        throw new Error('Failed to get player symbol!');
    }
};
