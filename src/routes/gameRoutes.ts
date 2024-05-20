import express from 'express';
import { createGame, addMoveToGame } from '../controllers/gameController';

const router = express.Router();

router.post('/create-game', createGame);
router.post('/make-move/:gameId', addMoveToGame);

export default router;
