'use strict';

/**
 * The FixedQueue behaves similar to an array
 * but explicitly limits the number of entries
 * it allows. Once that limit is passed the
 * first entries are shifted out making room
 * for new entries - FIFO!
 */
class FixedQueue {

  /**
   * @param  {Number} max
   * @param  {Array}  items
   */
  constructor(max, items) {
    this.max   = max || 50;
    items      = (items || []).slice(0);
    this.stack = FixedQueue.tail(items, this.max);
  }

  /**
   * How many items are in the queue!

   * @return {Number}
   */
  size() {
    return this.stack.length;
  }

  /**
   * Concatenate more items onto the queue
   *
   * @param  {Array|FixedQueue} items
   * @return {FixedQueue}
   */
  concat(items) {
    if (items instanceof FixedQueue) {
      items = items.stack.slice(0);
    }

    const merged = [].concat(this.stack, items);
    this.stack = FixedQueue.tail(merged, this.max);
    return this;
  }

  /**
   * Add an item to the queue
   *
   * @param  {Mixed} item
   * @return {Number}
   */
  push(item) {
    while (this.stack.length >= this.max) {
      this.stack.shift();
    }

    const length = this.stack.push(item);

    // @todo reevaluate
    // this[length - 1] = item;

    return length;
  }

  /**
   * @param  {Function} callback
   */
  forEach(callback) {
    return this.stack.forEach(callback);
  }

  /**
   * Remove all the items from the queue
   * @return {FixedQueue}
   */
  drain() {
    this.stack.length = 0;
    this.stack = [];
    return this;
  }

  /**
   * Hook up interator for the queue so you can use for-of
   *
   * @return {Iterator}
   */
  [Symbol.iterator]() {
    return this.stack[Symbol.iterator]();
  }
}

/**
 * Get the last x-number of items from an array - or get
 * the entire array if the array is smaller than the limit
 *
 * @param  {Array}  items
 * @param  {Number} limit
 * @return {Array}
 */
FixedQueue.tail = function(items, limit) {
  const length = items.length;

  if (length < limit) {
    return items;
  }

  return items.slice(length - limit, items.length);
};

module.exports = FixedQueue;
