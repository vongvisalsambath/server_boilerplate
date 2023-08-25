import httpErrors from "http-errors";
import ValidationError from "../exceptions/ValidationError";
import ClientError from "../exceptions/ClientError";
import config from "../config";

export default function (err, req, res, next) {
  const status = err.status || 500;
  const httpError = httpErrors(status);
  const errorMessage = err.message || "Unknown error";
  const response = { code: status };
  const { logger } = req.app.locals;

  if (err instanceof ValidationError) {
    Object.assign(response, { message: httpError.message });
    Object.assign(response, { errorValidation: err.validationErrors });
  } else if (err instanceof ClientError) {
    Object.assign(response, { message: errorMessage });
    logger.info(errorMessage, { url: req.originalUrl, method: req.method });
  } else {
    Object.assign(response, { message: httpError.message });
    logger.error(err.stack, { url: req.originalUrl, method: req.method });
  }

  if (config.isDev) {
    Object.assign(response, { error: err.stack });
  }

  res.status(status);
  res.json(response);
}
