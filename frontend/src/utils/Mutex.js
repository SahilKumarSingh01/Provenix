// utils/Mutex.js
export default class Mutex {
  constructor() {
    this._locked = false;
    this._queue = [];
  }

  lock() {
    return new Promise(resolve => {
      if (this._locked) {
        this._queue.push(resolve);
      } else {
        this._locked = true;
        resolve(this._unlock.bind(this));
      }
    });
  }

  _unlock() {
    if (this._queue.length > 0) {
      const next = this._queue.shift();
      next(this._unlock.bind(this));
    } else {
      this._locked = false;
    }
  }
}
