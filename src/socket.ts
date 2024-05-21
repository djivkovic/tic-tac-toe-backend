import { Server } from 'socket.io';
import * as GameService from '../src/services/gameService';

let io;

export const emitMoves = (room, data) => {
    io.to(room).emit('update_moves', { moves: data })
}

const onJoin = (socket) => {
    socket.on('join_room', async (data) => {
        const { room, userId, username } = data;

        if (!room || isNaN(room)) {
            console.error(`Invalid room value: ${room}`);
            socket.emit('join_room_response', { success: false, message: 'Invalid room value' });
            return;
        }

        const roomNumber = parseInt(room, 10);

        try {
            const game = await GameService.findGameById(roomNumber);

            if (!game) {
                console.log(`Game ${room} not found`);
                socket.emit('join_room_response', { success: false, message: 'Game not found' });
                return;
            }

            const socketsInRoom = await io.in(room).fetchSockets();

            if (socketsInRoom.length >= 2) {
                console.log('Room is full!');
                socket.emit('join_room_response', { success: false, message: 'Room is full!' });
                return;
            }

            if (game.players.length === 2 && !game.players.includes(userId)) {
                console.log('Max 2 players per game. Only existing players can rejoin.');
                socket.emit('join_room_response', { success: false, message: 'Max 2 players per game. Only existing players can rejoin.' });
                return;
            }

            if (!game.players.includes(userId)) {
                await GameService.addPlayerToGame(roomNumber, userId);
                console.log(`User ${userId} added to game ${room}`);
            } else {
                console.log(`User ${userId} is already in the game ${room}`);
            }

            socket.join(room);
            console.log(`User ${socket.id} has joined room ${room}`);

            const players = await GameService.getPlayersInGame(roomNumber);
            const playerUsernames = players.map(player => player.username);

            io.to(room).emit('update_players', { players: playerUsernames });
            socket.emit('join_room_response', { success: true, message: `User ${userId} joined room ${room}`, username });
        } catch (error) {
            console.error(`Error handling join_room for game ${room}:`, error);
            socket.emit('join_room_response', { success: false, message: 'Server error' });
        }
    });
}

const updateMoves = (socket) => {
    socket.on('update_moves', ({ roomId, moves }) => {
        io.to(roomId).emit('update_moves', { moves })
    });
}

const onDisconnect = (socket) => {
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
}
export const initSocket = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        onJoin(socket);

        updateMoves(socket);

        onDisconnect(socket);
    });

    return io;
};
