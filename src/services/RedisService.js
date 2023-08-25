import redis from "redis";
import bluebird from "bluebird";

export default {
  setup({ config, logger }) {
    const mainAuthOpts = config.app.isProd ? { password: config.redis.game.password } : null;
    const redisClient = redis.createClient(config.redis.game.port, config.redis.game.host, mainAuthOpts);

    bluebird.promisifyAll(redis);

    redisClient.on('connect', () => {
      logger.info(`[CACHE] ${config.redis.game.name} redis connected!`);
    });

    redisClient.on('error', (err) => {
      logger.error(`[CACHE] Error establishing ${config.redis.game.name} redis connection!`, err);
    });

    return redisClient;
  }
};
