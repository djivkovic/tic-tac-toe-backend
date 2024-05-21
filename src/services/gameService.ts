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
            winner: null
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
export const addMoveToGame = async (gameId: number, move: Move) => {
    try {
        const game = await findGameById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        game.moves.push(move);
        await game.save();

        Socket.emitMoves(gameId, game.moves);

        return game;
    } catch (error) {
        console.error('Error adding move to game:', error);
        throw new Error('Failed to add move to game!');
    }
};
