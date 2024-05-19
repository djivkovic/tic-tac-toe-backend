import express from 'express';
import cors from 'cors';
import http from 'http';
import { initSocket } from './socket';
import './db/config';
import authRouter from '../src/routes/authRoutes';
import gameRouter from '../src/routes/gameRoutes';

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app); 
initSocket(server); 

app.use('/api/auth', authRouter); 
app.use('/api/game', gameRouter); 

server.listen(5000, () => { 
    console.log('Server running on port 5000');
});
