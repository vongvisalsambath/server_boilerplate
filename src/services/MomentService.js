import moment from "moment";

export default {
  setup({ logger }) {
    return {
      get() {
        return moment;
      },

      getCurrentTimestamp() {
        return +moment().format('X');
      },

      createRoundId() {
        return +moment().add(2, "year").format('x');
      },

      getUTCEpochTime() {
        return +moment.utc().format('x');
      },

      getEpochTime() {
        return +moment().format('x');
      },

      getNewExpiration() {
        return +moment().add(1, "week").format('X');
      }
    };
  }
}
