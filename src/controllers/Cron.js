import nodeCron from "node-cron";

export default class Cron {
  io;

  logger;

  service;

  previousKeysOfOHLC;

  constructor({ logger, service, socket }) {
    this.logger = logger;
    this.service = service;
    this.io = socket.io;
    this.previousKeysOfOHLC = {};
  }

  static createInstance(library) {
    if (!this.instance) {
      this.instance = new Cron(library);
    }

    return this.instance;
  }

  static start() {
    // nodeCron.schedule('* * * * * *', this.instance.broadcastServerTime.bind(this.instance)); // 1s
  }
}
