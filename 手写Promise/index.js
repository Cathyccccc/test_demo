const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this.status = PENDING;
    this.data = undefined;
    this.micArr = [];
    try {
      executor(this._resolveFunc.bind(this), this._rejectFunc.bind(this));
    } catch (error) {
      this._rejectFunc(error);
    }
  }

  _resolveFunc(value) {
    this.setStatus(value, FULFILLED);
    console.log(this.status)
  }
  _rejectFunc(reason) {
    this.setStatus(reason, REJECTED);
  }

  setStatus(value, status) {
    if (this.status !== PENDING) return;
    this.data = value;
    this.status = status;
  }

  then(onFulfilledFunc, onRejectedFunc) {
    if (this.status === PENDING) return;
    return new MyPromise((resolve, reject) => {
      this.micArr.push({ status: FULFILLED, fn: onFulfilledFunc, resolve, reject });
      this.micArr.push({ status: REJECTED, fn: onRejectedFunc, resolve, reject });
      this.handler(); // 对then传递来的函数进行进一步的判断与处理
    })
  }

  handler() {
    while (this.micArr[0]) {
      if (this.micArr[0].status === this.status) {
        console.log(this.micArr[0]); // 放入微队列
        this.microQueue(this.micArr[0].fn);
      }
      this.micArr.shift();
    }
  }

  microQueue(fn) {
    // console.log(typeof window, typeof process)
    if (typeof process === 'undefined') {
      // console.log('browser')
      queueMicrotask(() => {
        fn(this.data)
      })
    } else {
      // console.log('node')
      process.nextTick(() => {
        fn(this.data)
      })
    }
  }
}

// new Promise((resolve, reject) => {
//   // resolve(1)
//   setTimeout(() => {
//     resolve(1)
//   }, 1000)
// }).then((res) => {
//   console.log(res)
// })


const pro = new MyPromise((resolve, reject) => {
  // resolve(1)
  // throw '123';
  setTimeout(() => {
    resolve(1)
  }, 1000)
}).then((res) => {
  console.log(res)
}, (err) => {
  console.log(err)
})
