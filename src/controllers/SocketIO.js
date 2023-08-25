/* eslint-disable no-throw-literal */

import { Server } from "socket.io";
import redisAdapter from "socket.io-redis";

import code from "../helpers/statusCodes";
import * as constants from "../helpers/constants";

const {
  SOCKET_IO_ERROR
} = constants;

export default class SocketIO {
  io;

  logger;

  handshake;

  constructor({ server, logger, service }) {
    this.logger = logger;
    this.service = service;

    const pubClient = service.redis;
    const subClient = pubClient.duplicate();

    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
    });

    this.io.adapter(redisAdapter({ pubClient, subClient }));
    this.listen();
  }

  listen() {
    // const adminNamespace = this.io.of(SOCKET_IO_ADMIN_NAMESPACE);

    // adminNamespace.on("connection", (socket) => {
    //   Admin.socketConnection(this, socket);
    // });
  }

  static createInstance(app) {
    if (!this.instance) {
      this.instance = new SocketIO(app);
    }

    return this.instance;
  }

  getPropData(message, prop) {
    let data;

    if (message) {
      data = message[prop];
      // if (!data) throw new Error(code.INVALID_USER_ID);
    } else {
      // throw new Error(code.INVALID_CANCEL_BET);
    }

    return data;
  }

  get io() {
    return this.instance.io;
  }

  disconnect(session) {
    const sockets = this.getSockets();

    sockets.forEach((sock) => {
      if (sock.value.handshake.sessionID === session.id) {
        this.logger.info("[GAME] User disconnected", session.payload);

        sock.value.emit("message", { e: "disconnect" });
        sock.value.disconnect();
      }
    });
  }

  getSockets() {
    const map = this.io.sockets.sockets;
    return Array.from(map, ([name, value]) => ({ name, value }));
  }

  emit(session, data) {
    const sockets = this.getSockets();

    sockets.forEach((sock) => {
      if (sock.value.handshake.sessionID === session.id) {
        this.logger.info("[GAME] User disconnected", session.payload);

        sock.value.emit("message", Object.assign(data, { e: SOCKET_IO_ERROR }));
        sock.value.disconnect();
      }
    });
  }
}
