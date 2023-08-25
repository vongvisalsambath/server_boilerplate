import * as utils from "../helpers/utils";

export default class CacheService {
  logger;

  service;

  constructor({ logger, service }) {
    this.logger = logger;
    this.service = service;
  }

  static createInstance(library) {
    if (!this.instance) {
      this.instance = new CacheService(library);
    }

    return this.instance;
  }

  getPriceData(params) {
    return new Promise(async (resolve, reject) => {

      try {

        if (!params) throw new Error('`params` argument is required in `getPriceData` fn');

        const marketIndex = this.service.store.getPlatformIndexByValue(params.symbol);
        const ds = this.service.redis;

        if (marketIndex) {
          let offset = params.offset;
          let count = params.count;
          let startTime = +params.startTime;
          let endTime = +params.endTime;
          let reverse = params.reverse;
          let interval = params.interval || "1s";

          let dsKey = `${marketIndex.asString}:ohlc`;
          let dsFn = reverse ? ds.zrevrangebyscoreAsync : ds.zrangebyscoreAsync;
          let dsFnArgs = [dsKey];

          if (count == 1 && endTime > 0) {

            let args = reverse ? [endTime, '-inf'] : [endTime, '+inf'];
            dsFnArgs.push(...args);

          } else {

            if (startTime && endTime) {

              let args = reverse ? [endTime, startTime] : [startTime, endTime];
              dsFnArgs.push(...args);

            } else if (!startTime && !endTime) {

              let args = reverse ? ['+inf', '-inf'] : ['-inf', '+inf'];
              dsFnArgs.push(...args);

            } else if (startTime && !endTime) {

              let args = reverse ? ['+inf', startTime] : [startTime, '+inf'];
              dsFnArgs.push(...args);

            } else if (!startTime && endTime) {

              let args = reverse ? [endTime, '-inf'] : ['-inf', endTime];
              dsFnArgs.push(...args);

            }
          }

          dsFnArgs.push('WITHSCORES');

          if (count != 'all') {
            dsFnArgs.push('LIMIT');
            dsFnArgs.push(offset);
            dsFnArgs.push(count);
          }

          let results = await dsFn.apply(ds, dsFnArgs).catch((err) => { throw err });
          let chartData = [];

          for (let i = 0; i < results.length; i += 2) {
            let tick = JSON.parse(results[i]);

            chartData.push({
              open: tick.open,
              high: tick.high,
              low: tick.low,
              close: tick.close,
              time: tick.time
            });
          }

          if (interval !== "1s") {
            chartData = chartData.sort((a, b) => { // sort by asc
              if (a.time < b.time) {
                return -1;
              }

              if (a.time > b.time) {
                return 1;
              }

              return 0;
            });

            chartData = utils.findOHLCByInterval(chartData, interval, this.service);
          }

          if (reverse) {
            chartData = chartData.sort((a, b) => { // sort by desc
              if (a.time > b.time) {
                return -1;
              }

              if (a.time < b.time) {
                return 1;
              }

              return 0;
            });
          }

          if (chartData) {
            resolve(chartData);
          } else {
            throw 'No data found in `getChartData` fn';
          }

        } else {
          resolve([]);
        }

      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }
}
