import mongoose, { Schema, Document, Model } from "mongoose";

interface Game extends Document {
    gameId: number;
    gameType: string;
    players: string[];
    moves: Move[];
    winner?: string | null;
    playerSymbols: PlayerSymbol[];
}

interface PlayerSymbol {
    playerId: string;
    symbol: string;
}

export interface Move {
    index: {
        x: number;
        y: number;
    };
    sign: string;
    userId: string;
}

const moveSchema: Schema<Move> = new Schema<Move>({
    index: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    sign: { type: String, required: true },
    userId: { type: String, required: true }
});

const playerSymbolSchema: Schema<PlayerSymbol> = new Schema<PlayerSymbol>({
    playerId: { type: String, required: true },
    symbol: { type: String, required: true }
});

const gameSchema: Schema<Game> = new Schema<Game>({
    gameId: { type: Number, required: true, unique: true },
    gameType: { type: String, required: true },
    players: { type: [String], required: false },
    moves: { type: [moveSchema], required: false },
    winner: { type: String, default: null },
    playerSymbols: { type: [playerSymbolSchema], required: true }
});

const GameModel: Model<Game> = mongoose.model<Game>("Game", gameSchema);

const generateGameId = async (): Promise<number> => {
    try {
        const lastGame = await GameModel.findOne({}, {}, { sort: { 'gameId': -1 } });
        if (lastGame) {
            return lastGame.gameId + 1;
        } else {
            return 1;
        }
    } catch (error) {
        throw new Error("Failed to generate game ID");
    }
}

export { GameModel, generateGameId };
