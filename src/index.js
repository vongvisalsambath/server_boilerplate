import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import FileStore from "session-file-store";
import session from "express-session";
import compression from "compression";
import farmhash from "farmhash";
import cluster from "cluster";
import helmet from "helmet";
import cors from "cors";
import ejs from "ejs";
import net from "net";
import os from "os";

import config from "./config";
import Services from "./services";
import Server from "./controllers/Server";
import Logger from "./controllers/Logger";

const totalCPUs = config.app.isDev ? 1 : os.cpus().length;
const port = Server.normalizePort(config.app.port || '6173');

const logger = new Logger({
  echo: config.logger.consoleLogLevel,
  errorLevel: config.logger.fileLogLevel,
  filename: config.logger.logFileName
}).create();

process.stdin.resume();

process.on('uncaughtException', (err) => {
  console.log(err)
  logger.fatal('System error', { message: err.message, stack: err.stack });
  process.emit('cleanup');
});

process.once('SIGTERM', () => {
  logger.info('caught SIGTERM');
  process.emit('cleanup');
});

process.once('exit', () => {
  logger.info('caught internal exit');
  process.emit('cleanup');
});

process.once('SIGINT', () => {
  logger.info('caught SIGINT');
  process.emit('cleanup');
});

if (cluster.isPrimary || cluster.isMaster) {
  logger.info(`# The Server started on: ${ Server.getIPAddress() }:${ port }`);
  logger.info(`Number of CPUs is ${totalCPUs}`);
  logger.info(`Master ${process.pid} is running`);

  // This stores our workers. We need to keep them to be able to reference
	// them based on source IP address. It's also useful for auto-restart,
	// for example.
  const workers = [];

  // Helper function for spawning worker at index 'i'.
  const spawn = (i) => {
		workers[i] = cluster.fork();

		// Optional: Restart worker on exit
		workers[i].on('exit', (code, signal) => {
			logger.info('respawning worker', i);
			spawn(i);
		});
  };

  // Spawn workers.
  for (let i = 0; i < totalCPUs; i++) {
    spawn(i);
  }

  // Helper function for getting a worker index based on IP address.
	// This is a hot path so it should be really fast. The way it works
	// is by converting the IP address to a number by removing non numeric
  // characters, then compressing it to the number of slots we have.
	//
	// Compared against "real" hashing (from the sticky-session code) and
	// "real" IP number conversion, this function is on par in terms of
	// worker index distribution only much faster.
	const worker_index = (ip, len) => farmhash.fingerprint32(ip) % len; // Farmhash is the fastest and works with IPv6, too

  // Create the outside facing server listening on our port.
  net.createServer({ pauseOnConnect: true }, (connection) => {
    // We received a connection and need to pass it to the appropriate
    // worker. Get the worker for this connection's source IP and pass
    // it the connection.
    const worker = workers[worker_index(connection.remoteAddress, totalCPUs)];

    worker.send('sticky-session:connection', connection);
  }).listen(port);
} else {
  const app = express();

  const sessionMiddleware = session({
    resave: true,
    saveUninitialized: true,
    secret: config.session.secretKey,
    httpOnly: true,  // dont let browser javascript access cookie ever
    ephemeral: true, // delete this cookie while browser close
    cookie: { maxAge: config.session.maxAge },
    store: new (FileStore(session))({
      logFn: () => {},
      reapInterval: config.session.reapInterval,
    })
  });

  app.use("/static", express.static(path.join(__dirname, 'public')));

  app.engine('html', ejs.renderFile);

  app.set('view engine', 'html');
  app.set("views", __dirname);

  app.use(helmet({ frameguard: false }));
  app.use(cors());
  app.use(compression());
  app.options('*', cors());
  app.use(sessionMiddleware);

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));

  // parse application/json
  app.use(bodyParser.json());

  app.use(cookieParser());

  Services.setup({ app, config, logger });

  app.locals.logger = logger;
  app.locals.server = new Server(app, sessionMiddleware);
}

