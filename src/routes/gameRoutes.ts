import express from 'express';
import { createGame, addMoveToGame, getMovesByGameId } from '../controllers/gameController';

const router = express.Router();

router.post('/create-game', createGame);
router.post('/make-move/:gameId', addMoveToGame);
router.get('/moves/:gameId', getMovesByGameId);

export default router;
