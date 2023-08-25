import * as socketActions from "./socket";
import * as cronActions from "./cron";

export default {
  setup({ logger }) {
    let state = {};

    const mapState = (reducers) => {
      return Object.keys(reducers)
        .map((key) => ({
          key: key,
          value: reducers[key].bind(state),
        }))
        .reduce((total, fn) => {
          total[fn.key] = fn.value;
          return total;
        }, {});
    };

    return {
      setState(arg) {
        let newState;

        if (typeof arg === 'function') {
          newState = arg(state);
        } else {
          newState = arg;
        }

        if (newState && Object.keys(newState).length) {
          state = Object.assign(state, newState);
        }

        return state;
      },

      getState() {
        return state;
      },

      ...mapState(socketActions),
      ...mapState(cronActions),
    }
  }
};
