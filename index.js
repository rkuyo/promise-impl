const PENDING = 0
const FULFILLED = 1
const REJECTED = 2

/**
 * @param {(resolve: (val: any) => void, reject: (reason?: any) => void) => void} executor Ties an outcome to an eventual.
 */
export function Eventual(executor) {
  const self = this
  if (!self) {
    throw new TypeError("Eventual constructor be called with 'new'")
  }

  checkExecutor(executor)

  let state = PENDING
  let val = null
  let handlers = []

  function fulfill(result) {
    state = FULFILLED
    val = result
    process.nextTick(() => runHandlers())
  }

  function reject(err) {
    state = REJECTED
    val = err
    process.nextTick(() => runHandlers())
  }

  function resolve(result) {
    if (self === result)
      return reject(new TypeError("An eventual cannot be resolved with itself"))
    try {
      const then = getThen(result)
      if (then) {
        return resolver(then.bind(result), resolve, reject)
      }
      fulfill(result)
    } catch (e) {
      reject(e)
    }
  }

  function runHandlers() {
    handlers.forEach(handle)
    handlers = null
  }

  function handle(handler) {
    if (state === PENDING) return handlers.push(handler)
    if (state === FULFILLED && isFn(handler.didFulfil)) {
      handler.didFulfil(val)
    }
    if (state === REJECTED && isFn(handler.didReject)) {
      handler.didReject(val)
    }
  }

  self._done = function (didFulfil, didReject) {
    process.nextTick(function () {
      handle({
        didFulfil,
        didReject,
      })
    })
    console.log("done")
  }

  resolver(executor, resolve, reject)
}

Eventual.prototype.then = function (didFulfil, didReject) {
  const self = this

  function nextExecutor(resolve, reject) {
    return self._done(
      function (result) {
        if (!isFn(didFulfil)) return resolve(result)
        try {
          return resolve(didFulfil(result))
        } catch (err) {
          return reject(err)
        }
      },
      function (err) {
        if (!isFn(didReject)) return reject(err)
        try {
          return resolve(didReject(err))
        } catch (err) {
          return reject(err)
        }
      }
    )
  }

  return new Eventual(nextExecutor)
}

function getThen(val) {
  if (!val) return null
  if (!isObj(val) & !isFn(val)) return null

  const then = val.then
  if (isFn(then)) return then
}

function resolver(executor, didFulfil, didReject) {
  let done = false

  function resolve(val) {
    if (done) return
    done = true
    didFulfil(val)
  }

  function reject(reason) {
    if (done) return
    done = true
    didReject(reason)
  }

  try {
    executor(resolve, reject)
  } catch (err) {
    if (done) return
    done = true
    didReject(err)
  }
}

function checkExecutor(executor) {
  if (!executor) {
    throw new TypeError("Eventual executor must be provided")
  }

  if (!isFn(executor)) {
    throw new TypeError("Eventual executor must be callable")
  }
}

function isFn(val) {
  return typeof val === "function"
}

function isObj(val) {
  return typeof val === "object"
}
