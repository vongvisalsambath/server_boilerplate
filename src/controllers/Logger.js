import fs from "fs";
import util from "util";
import path from "path";
import strftime from "strftime";
import "colors";

export default class Logger {
  exports = {};

  config;

  constructor(config) {
    this.config = config || {};

    this.config.levels = this.config.levels || {
      trace: 0,
      debug: 1,
      log: 2,
      info: 3,
      warn: 4,
      error: 5,
      fatal: 6
    };

    this.config.level_abbr = this.config.level_abbr || {
      trace: 'trc',
      debug: 'dbg',
      log: 'log',
      info: 'inf',
      warn: 'WRN',
      error: 'ERR',
      fatal: 'FTL'
    };

    this.config.errorLevel = this.config.errorLevel || 'log';
  }

  snipsecret(data) {
		Object.keys(data).forEach((key) => {
      if (key.search(/secret/i) > -1) {
				data[key] = 'XXXXXXXXXX';
			}

      return 0;
    });

		return data;
	}

  create() {
    exports.setLevel = function (errorLevel) {
      this.config.errorLevel = errorLevel;
    };

    Object.keys(this.config.levels).forEach((name) => {
      const filename = this.config.filename[name] || "../logs/logs.log";
      const filePath = path.resolve(__dirname, `../${ filename }`) || `${ __dirname }/logs.log`;
      const logFile = fs.createWriteStream(filePath, {flags: 'a'});

      const logFn = (message, data) => {
        const log = {
          level: name,
          timestamp: strftime('%F %T', new Date())
        };

        if (message instanceof Error) {
          log.message = message.stack;
        } else if (message) {
          log.message = message.toString();

          if (log.message.startsWith('# ')) {
            const head = '#' . repeat(message.length + 2);
            log.message = `${head  }\n`;
            log.message += `${message  } #\n`;
            log.message += head;
          }
        } else {
          log.message = message;
        }

        if (data && util.isObject(data)) {
          log.data = JSON.stringify(this.snipsecret(data));
        } else {
          log.data = data;
        }

        log.symbol = this.config.level_abbr[log.level] ? this.config.level_abbr[log.level] : '???';

        if (this.config.levels[this.config.errorLevel] <= this.config.levels[log.level]) {
          log.message.split('\n').forEach((m) => {
            if (log.data) {
              logFile.write(util.format('[%s] %s | %s - %s\n', log.symbol, log.timestamp, m, log.data));
            } else {
              logFile.write(util.format('[%s] %s | %s\n', log.symbol, log.timestamp, m));
            }
          });
        }

        let color = 'white';
        let bgColor = 'bgBlack';

        if (this.config.echo && this.config.levels[this.config.echo] <= this.config.levels[log.level]) {
          log.message.split('\n').forEach((m) => {

            if (this.config.levels[name] === this.config.levels.warn) {
              color = 'black';
              bgColor = 'bgYellow';
            } else if (this.config.levels[name] > this.config.levels.warn) {
              bgColor = 'bgRed';
            }

            if (log.data) {
              console.log(`[${  log.symbol[bgColor][color]  }]`, log.timestamp.grey, '|', m, '-', log.data);
            } else {
              console.log(`[${  log.symbol[bgColor][color]  }]`, log.timestamp.grey, '|', m);
            }
          });
        }
      };

      exports[name] = logFn;
    });

    return exports;
  }
}
