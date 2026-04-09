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
      // 1. Try Internal JWT
      try {
        jwt.verify(token, JWT_SECRET);
        return next();
      } catch (err) {
        // 2. Try Firebase Decode
        const decoded: any = jwt.decode(token);
        const isFirebase = decoded && (
          (decoded.iss && decoded.iss.includes('firebase')) ||
          (decoded.iss && decoded.iss.includes('google.com')) ||
          (decoded.aud && decoded.aud.includes('neurocloak'))
        );

        if (isFirebase) {
          return next();
        }
        
        console.warn('Socket Auth Rejected:', { iss: decoded?.iss, aud: decoded?.aud });
        next(new Error('Authentication error'));
      }
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
