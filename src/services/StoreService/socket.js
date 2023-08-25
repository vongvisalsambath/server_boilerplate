export const setSocketRoom = function (type, key, socketId) {
  this.rooms = this.rooms || {};
  this.rooms[type] = this.rooms[type] || {};
  this.rooms[type][key] = this.rooms[type][key] || [];
  this.rooms[type][key].push(socketId);
};

export const getSocketRoomsByType = function (type) {
  return this.rooms && this.rooms[type];
};

export const getSocketRoomsByKey = function (type, key) {
  return this.rooms && this.rooms[type] && this.rooms[type][key];
};

export const leaveSocketRoom = function (type, key, socketId) {
  this.rooms[type] = this.rooms[type] || {};
  this.rooms[type][key] = this.rooms[type][key] || [];
  this.rooms[type][key] = this.rooms[type][key].filter(id => id !== socketId);
};

export const getSocketRooms = function () {
  return this.rooms;
}
