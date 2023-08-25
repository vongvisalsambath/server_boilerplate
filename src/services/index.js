import DatabaseService from "./DatabaseService";
import MomentService from "./MomentService";
import RedisService from "./RedisService";
import StoreService from "./StoreService";
import HTTPService from "./HTTPService";
import CacheService from "./CacheService";

export default {
  setup({ app, config, logger }) {
    app.locals.service = app.locals.service || {};

    app.locals.service.store = StoreService.setup({ logger });
    app.locals.service.redis = RedisService.setup({ config, logger });
    app.locals.service.db = DatabaseService.setup({ config, logger });
    app.locals.service.http = HTTPService.setup({ logger });
    app.locals.service.moment = MomentService.setup({ logger });
    app.locals.service.cache = CacheService.createInstance({
      logger,
      service: app.locals.service
    });
  }
}
