import code from "../helpers/statusCodes";
import QueryService from "../services/QueryService";

export default class API {
  logger;

  service;

  constructor({ logger, service }) {
    this.logger = logger;
    this.service = service;
  }
}
