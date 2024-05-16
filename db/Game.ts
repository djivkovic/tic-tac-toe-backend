import mongoose, { Schema, Document, Model } from "mongoose";

interface Game extends Document {
    gameId: number;
    gameType: string;
    moves: Move[];
    winner?: string | null;
}

interface Move {
    index: number;
    player: string;
}

const gameSchema: Schema<Game> = new Schema<Game>({
    gameId: Number,
    gameType: String,
    moves: [{
        index: Number,
        player: String
    }],
    winner: String, 
});
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

const GameModel: Model<Game> = mongoose.model<Game>("games", gameSchema);

export { GameModel, generateGameId };
