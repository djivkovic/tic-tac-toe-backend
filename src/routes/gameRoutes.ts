import { Router } from 'express';
import * as GameController from '../controllers/gameController';

const router = Router();

router.post('/create-game', GameController.createGame);
router.post('/make-move/:gameId', GameController.addMoveToGame);
router.get('/moves/:gameId', GameController.getMovesByGameId);
router.post('/assign-player/:gameId', GameController.assignPlayer);
router.get('/player-symbol/:gameId/:userId', GameController.getPlayerSymbol);
router.get('/find-game/:gameId/:userId', GameController.findGameHistoryById);
router.get('/find-game/:gameId', GameController.findGame);
router.get('/players/:gameId', GameController.getPlayersUsername);
router.get('/winner/:gameId', GameController.getWinnerByGameId); 

export default router;
