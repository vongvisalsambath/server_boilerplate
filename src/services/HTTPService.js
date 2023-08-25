import axios from "axios";

export default {
  setup({ logger }) {
    axios.defaults.timeout = 60000;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    return {
      get(url, params, headers) {
        return new Promise((resolve, reject) => {
          try {

            axios.get(url, { params, headers })
              .then((response) => {
                resolve(response && response.data);
              })
              .catch(reject);

          } catch (err) {
            reject(err);
          }
        });
      },

      post(url, params, headers) {
        return new Promise((resolve, reject) => {
          try {

            axios.post(url, params, headers)
              .then((response) => {
                resolve(response.data);
              })
              .catch(reject);

          } catch (err) {
            reject(err);
          }
        });
      }
    };
  }
};
