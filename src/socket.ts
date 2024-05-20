import { Server } from 'socket.io';
import * as GameService from '../src/services/gameService';
export const initSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('send_message', (data) => {
            if (data.room) {
                socket.to(data.room).emit('receive_message', data);
            } else {
                io.emit('receive_message', data);
            }
            console.log(data);
        });
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
                if (game) {
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
                } else {
                    console.log(`Game ${room} not found`);
                    socket.emit('join_room_response', { success: false, message: 'Game not found' });
                }
            } catch (error) {
                console.error(`Error handling join_room for game ${room}:`, error);
                socket.emit('join_room_response', { success: false, message: 'Server error' });
            }
        });

        socket.on('leave_room', async (room) => {
            const socketsInRoom = await io.in(room).fetchSockets();
            socket.leave(room);
            console.log(`User ${socket.id} has left room ${room}`);
            console.log('Sockets in room ', room, socketsInRoom.map(socket => socket.id));
        });

        socket.on('update_moves', ({ roomId, moves }) => {
            console.log("MOVES: ", moves);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};
