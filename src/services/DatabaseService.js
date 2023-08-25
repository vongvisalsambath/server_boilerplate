import mysql from "mysql";

export default {
  setup({ config, logger }) {
    return Object.keys(config.db).reduce((total, key) => {
      const mysqlPool = mysql.createPool(config.db[key]);

      mysqlPool.query('SELECT 1 + 1 AS solution', (err, res) => {
        if (res) {
          logger.info(`[DB] ${config.db[key].database} database connected!`);
        } else {
          logger.error(`[DB] Error establishing ${config.db.game.database} database connection!`, err);
        }
      });

      total[key] = mysqlPool;

      return total;
    }, {});
  }
};
