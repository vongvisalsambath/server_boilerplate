import os from "os";
import createError from "http-errors";
import routes from "../routes";
import SocketIO from "./SocketIO";
import config from "../config/app";
import errorHandler from "../middleware/ErrorHandler";
import Cron from "./Cron";

export default class Server {
  httpServer;

  socket;

  logger;

  service;

  app;

  proxyServer;

  constructor(app, sessionMiddleware) {
    const { logger, service } = app.locals;

    this.app = app;
    this.logger = logger;
    this.service = service;

    this.httpServer = app.listen(0, 'localhost');

    this.onListen(sessionMiddleware);

    // Listen to messages sent from the master. Ignore everything else.
    process.on('message', (message, connection) => {
      if (message !== 'sticky-session:connection') {
        return;
      }

      // Emulate a connection event on the server by emitting the
      // event with the connection the master sent us.
      this.httpServer.emit('connection', connection);

      connection.resume();
    });
  }

  static normalizePort(val) {
    const port = parseInt(val, 10);

    if (Number.isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return port;
  }

  onError(error, port) {
    if (error.syscall !== 'listen') {
      this.logger.error(error);
      throw error;
    }

    const bind = typeof port === 'string' ?
      `Pipe ${port}` :
      `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        this.logger.error(`[APP] ${bind} requires elevated privileges.`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        this.logger.error(`[APP] ${bind} is already in use.`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  async onListen(sessionMiddleware) {
    await this.loadStore();

    this.setupSocketIO(sessionMiddleware);
    this.startCron();

    this.registerRoute();
    this.registerMiddlewareAfterRoute();
  }

  static getIPAddress() {
    if (config.isDev) return '127.0.0.1';

    const interfaces = os.networkInterfaces();

    Object.keys(interfaces).forEach((iface) => {
      for (let i = 0; i < interfaces[iface].length; i++) {
        const alias = interfaces[iface][i];

        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }

      return 0;
    });

    return '0.0.0.0';
  }

  get store() {
    return this.service.store;
  }

  get httpServer() {
    return this.httpServer;
  }

  setupSocketIO(sessionMiddleware) {
    this.socket = SocketIO.createInstance({
      server: this.httpServer,
      logger: this.logger,
      service: this.service
    });

    // this.socket.io.of(SOCKET_IO_ADMIN_NAMESPACE).use((socket, next) => {
    //   sessionMiddleware(socket.handshake, {}, next);
    // });

    this.app.locals.socket = this.socket;
  }

  async loadStore() {
    Promise.resolve();
  }

  registerRoute() {
    routes.map((route) => this.app.use('/', route({ store: this.service.store })));
  }

  registerMiddlewareAfterRoute() {
    // catch 404 and forward to error handler
    this.app.use((req, res, next) => {
      next(createError(404));
    });

    this.app.use(errorHandler);
  }

  startCron() {
    Cron.createInstance({
      logger: this.logger,
      service: this.service,
      socket: this.socket
    });

    Cron.start();
  }

  get io() {
    return this.socket && this.socket.io;
  }
}
