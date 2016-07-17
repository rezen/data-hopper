'use strict';

const assert     = require('assert');
const FixedQueue = require('../fixed-queue');

describe('FixedQueue', () => {

  describe('#constructor', () => {
    it('Can accept queue size', () => {
      let q = new FixedQueue(2);
      assert.equal(q.max, 2);
      assert.equal(q.stack.length, 0);
      assert(Array.isArray(q.stack));
    });

    it('Can accept an initial set of data', () => {
      const d = [1, 2, 3];
      let q = new FixedQueue(null, d);

      assert.deepEqual(q.stack, d);
    });

    it('Truncates the initial set of data if larger than the queue size', () => {
      const d = [1, 2, 3];
      let q = new FixedQueue(2, d);

      assert.deepEqual(q.stack, [2, 3]);
    });
  });

  describe('#concat', () => {
    it('Adds an array to the queue', () => {
      const d = [1, 2, 3];
      const tail = [4, 5, 6];
      let q = new FixedQueue(6, d.slice(0));
      q.concat(tail);

      assert.deepEqual(q.stack, d.concat(tail));
    });

    it('Concatted items are newer so the originals are truncated', () => {
      const d = [1, 2, 3];
      const tail = [4, 5, 6];
      let q = new FixedQueue(4, d.slice(0));
      q.concat(tail);
      assert.equal(q.stack.length, 4);
      assert.deepEqual(q.stack, [3, 4, 5, 6]);
    });

    it('Can concat other FixedQueues', () => {
      const d = [1, 2, 3];
      const tail = ['x', 'y', 'z'];
      let q = new FixedQueue(4, d.slice(0));
      let q2 = new FixedQueue(4, tail.slice(0));

      q.concat(q2);

      assert.equal(q.stack.length, 4);
      assert.deepEqual(q.stack, [3, 'x', 'y', 'z']);
    });
  });

  describe('#push', () => {
    it('Pushes new items onto the queue stack', () => {
      let q = new FixedQueue(12);
      const name = 'jane';
      const idx = q.push(name) - 1;
      assert(Array.isArray(q.stack));
      assert.equal(q.stack.length, 1);
      assert.equal(q.stack.indexOf(name), idx);
    });

    it('New items keep getting pushed and the old ones are removed', () => {
      let q = new FixedQueue(12);
      const numbers = Array.apply(null, {length: 16}).map(Number.call, Number);
      numbers.map(n => q.push(n));
      assert.equal(numbers[0], 0);
      assert.equal(q.stack[0], 4);
      assert.equal(q.stack.length, 12);
    });
  });

  describe('#forEach', () => {
    it('Pushes new items onto the queue stack', () => {
      const stack = [];
      const d = ['a', 'b'];
      let q = new FixedQueue(2, d);
     
      q.forEach(function(item) {
        stack.push(item);
      });

      assert.equal(stack.length, 2);
      assert.equal(stack[0], d[0]);
      assert.equal(stack[1], d[1]);
    });
  });

  describe('#drain', () => {
    it('Empties the queue', () => {
      let q = new FixedQueue(2, ['a', 'b']);
      assert.equal(q.stack.length, 2);
      q.drain();
      assert.equal(q.stack.length, 0);
    });
  });

  describe('Symbol.iterator', () => {
    it('Empties the queue', () => {
      const stack = [];
      let q = new FixedQueue(2, ['a', 'b']);

      for (let val of q) {
        stack.push(val);
      }

      assert.equal(stack.length, 2);
    });
  });

  describe('.tail', () => {
    it('Gets the tail number of items from the list', () => {
      assert.deepEqual(FixedQueue.tail([1, 2, 3], 1), [3]);
      assert.deepEqual(FixedQueue.tail([1, 2, 3], 2), [2, 3]);
    });
  });
});