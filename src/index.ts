import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { AddressInfo } from 'net';
import cors from 'cors';

interface Room {
  host: string;
  guests: Set<string>;
  words: {
    [word: string]: {
      upvotes: Set<string>;
    };
  };
}

const randomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  return Array(10).fill(0).map(_ => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const serializeWords = (words: Room['words']) =>
  Object.entries(words)
    .map(([k, v]) => [k, { ...v, upvotes: Array.from(v.upvotes) }])
    .reduce((acc, n) => ({ ...acc, [n[0] as string]: n[1] }), {});

export class Application {
  private readonly _express: express.Express;
  private readonly _srv: http.Server;
  private readonly _io: Server;
  private _hostname = 'localhost';
  private _port = 8080;

  private readonly _rooms: { [roomCode: string]: Room } = {};

  constructor() {
    this._express = express();
    this._express.use(cors());
    const staticPath = process.env.NODE_ENV === 'production'
      ? 'build'
      : 'frontend/build';
    console.log('static path: ', staticPath);
    this._express.use(express.static(staticPath));
    this._srv = http.createServer(this._express);
    this._io = new Server(this._srv, {
      cors: {
        origin: '*',
      }
    });
  }

  start(port: number = 8080, hostname: string = 'localhost'): Promise<AddressInfo> {
    this._port = port;
    this._hostname = hostname;
    return new Promise((resolve, reject) => {
      try {
        return this._srv.listen(this._port, this._hostname, () => {
          this._io.listen(this._srv);
          resolve(this._srv.address() as AddressInfo);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  static create() {
    const app = new Application();
    app._io.on('connection', socket => {
      console.info('CONNECTED: ' + socket.id);

      socket.on('session:host', async () => {

        const roomCode = app.resolveRoomName();
        await socket.join(roomCode);

        app._rooms[roomCode] = {
          host: socket.id,
          guests: new Set(),
          words: {},
        };
        socket.emit('session:roomcode', roomCode);
      });

      socket.on('session:join', async (roomCode: string) => {
        if (!app._rooms[roomCode])
          return;

        await socket.join(roomCode);
        app._rooms[roomCode].guests.add(socket.id);
        socket.emit(
          'session:joined',
          roomCode,
          serializeWords(app._rooms[roomCode].words)
        );
      });

      socket.on('session:leave', async (roomCode: string) => {
        const room = app._rooms[roomCode];

        if (!room)
          return;

        await socket.leave(roomCode);

        if (socket.id === room.host) {
          app._io.to(roomCode).disconnectSockets();
          delete app._rooms[roomCode];
        } else {
          room.guests.delete(socket.id);
        }
      });

      socket.on('disconnect', reason => {
        console.log(`${socket.id} disconnected: ${reason}`);
        Object.entries(app._rooms).forEach(([roomCode, room]) => {
          if (socket.id === room.host) {
            app._io.to(roomCode).disconnectSockets();
            delete app._rooms[roomCode];
          } else {
            room.guests.delete(socket.id);
          }
        });
      });

      socket.on('session:word:add', (roomCode: string, word: string) => {
        const room = app._rooms[roomCode];

        if (!room)
          return;

        if (room.words[word]) {
          room.words[word].upvotes.add(socket.id);
        } else {
          room.words[word] = { upvotes: new Set([socket.id]) };
        }

        const words = serializeWords(room.words);

        console.log(words);
        app._io.to(roomCode).emit(
          'session:words:updated',
          words
        );
      });

      socket.on('session:word:remove', (roomCode: string, word: string) => {
        const room = app._rooms[roomCode];

        if (!room)
          return;
        if (room.host !== socket.id)
          return;

        delete room.words[word];

        app._io.to(roomCode).emit('session:words:removed', word);
      })
    });
    return app;
  }

  private resolveRoomName() {
    let roomName = randomCode();
    while (this._io.of('/').adapter.rooms.has(roomName)) { // If it already exists, create another code
      roomName = randomCode();
    }
    return roomName;
  }
}

if (require.main?.filename === __filename) {
  Application
    .create()
    .start()
    .then(addr => console.log(`App started on http://${addr.address}:${addr.port}`));
}
