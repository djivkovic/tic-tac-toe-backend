import { Router } from 'express';
import * as GameController from '../controllers/gameController';

const router = Router();

router.post('/create-game', GameController.createGame);
router.post('/make-move/:gameId', GameController.addMoveToGame);
router.get('/moves/:gameId', GameController.getMovesByGameId);
router.post('/assign-player/:gameId', GameController.assignPlayer);
router.get('/player-symbol/:gameId/:userId', GameController.getPlayerSymbol);

export default router;
