import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

let io: Server;

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.use((socket: Socket, next: (err?: any) => void) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      jwt.verify(token, JWT_SECRET);
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
  });
};

export const emitEvent = (event: string, data: any) => {
  if (io) io.emit(event, data);
};
