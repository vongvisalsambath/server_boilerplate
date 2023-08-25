export const addCronTask = function (id, task) {
  this.crons = this.crons || {};
  this.crons[id] = task;
};

export const getCronTask = function (id) {
  return this.crons && this.crons[id];
};

export const stopCronTask = function (id) {
  if (this.crons && this.crons[id]) {
    this.crons[id].stop();
  }
}
