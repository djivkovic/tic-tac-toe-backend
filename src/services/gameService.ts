import { GameModel, generateGameId, Move } from '../db/Game';
import UserModel from '../db/User';
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
            playerSymbols: [],
            currentPlayer: null
        });

        await newGame.save();

        return { gameId };
    } catch (error) {
        throw new Error('Failed to create game!');
    }
};

export const findGameById = async (gameId: number) => {
    try {
        const game = await GameModel.findOne({ gameId });

        if (!game) {
            throw new Error('Game not found');
        }

        return game;
    } catch (error) {
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

        if (game.players.length !== 2) {
            throw new Error('Two players are required to assign symbols');
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

        const otherSign = sign === 'X' ? 'O' : 'X';
        const otherPlayerId = game.players.find(pid => pid !== userId);

        if (!otherPlayerId){
            throw new Error('Other player not found');
        }

        game.playerSymbols.push({ playerId: otherPlayerId, symbol: otherSign });

        game.currentPlayer = (sign === 'X') ? userId : otherPlayerId;

        Socket.emitAssignSign(gameId);

        await game.save();

        return game;
    } catch (error) {
        throw new Error('Failed to assign player!');
    }
};

export const addMoveToGame = async (gameId: number, userId: string, move: Move) => {
    try {
        const game = await findGameById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        if (game.winner) {
            throw new Error('Game has already been won!');
        }

        if (game.currentPlayer !== userId) {
            throw new Error('Not your turn to play!');
        }

        const existingMove = game.moves.find(m => m.index.x === move.index.x && m.index.y === move.index.y);

        if (existingMove) {
            throw new Error(`Move (${move.index.x}, ${move.index.y}) already exists!`);
        }

        game.moves.push(move);

        const winner = checkWinner(game.moves);
        if (winner) {
            game.winner = winner;
        } else {
            game.currentPlayer = (game.currentPlayer === game.players[0]) ? game.players[1] : game.players[0];
        }

        await game.save();

        Socket.emitMoves(gameId, move);

        return game;
    } catch (error) {
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
        throw new Error('Failed to get moves by gameId!');
    }
};

export const getPlayerSymbol = async (gameId: number, userId: string) => {
    try {
        const game = await findGameById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        if (game.players.length !== 2) {
            throw new Error('Two players are required to get player symbol');
        }

        const playerSymbol = game.playerSymbols.find(ps => ps.playerId === userId);
        if (!playerSymbol) {
            throw new Error('Player has not been assigned a symbol');
        }

        return playerSymbol.symbol;
    } catch (error) {
        throw new Error('Failed to get player symbol!');
    }
};

const checkWinner = (moves: Move[]): string | null => {
    const winningCombinations = [
        [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
        [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
        [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
        [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
        [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
        [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
        [{ x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 0 }],
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        const moveA = moves.find(m => m.index.x === a.x && m.index.y === a.y);
        const moveB = moves.find(m => m.index.x === b.x && m.index.y === b.y);
        const moveC = moves.find(m => m.index.x === c.x && m.index.y === c.y);

        if (moveA && moveB && moveC && moveA.sign === moveB.sign && moveA.sign === moveC.sign) {
            return moveA.userId;
        }
    }

    return null;
};
