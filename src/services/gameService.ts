import { GameModel, generateGameId } from '../db/Game';
import UserModel from '../db/User';
import { Move } from '../db/Game';

export const createGame = async (gameType: string) => {
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
};

export const findGameById = async (gameId: number) => {
    return await GameModel.findOne({ gameId });
};
export const addPlayerToGame = async (gameId: number, userId: string) => {
    const game = await GameModel.findOne({ gameId });
    if (!game) {
        throw new Error('Game not found');
    }

    if (!game.players.includes(userId)) {
        game.players.push(userId);
        await game.save();
    }

    return game;
};
export const getPlayersInGame = async (gameId: number) => {
    const game = await GameModel.findOne({ gameId });
    if (!game) {
        throw new Error('Game not found');
    }

    return await UserModel.find({ _id: { $in: game.players } }, 'username');
};
export const addMoveToGame = async (gameId: number, move: Move) => {
    const game = await GameModel.findOne({ gameId });
    if (!game) {
        throw new Error('Game not found');
    }

    game.moves.push(move);
    await game.save();

    return game;
};
