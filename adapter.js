import { Eventual } from "./index.js"

// const resolved = (value) => new Eventual((res, rej) => res(value))

// const rejected = (reason) => new Eventual((res, rej) => rej(reason))

const deferred = () => {
  let resolve
  let reject

  const promise = new Eventual((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, reject, resolve }
}

export const adapter = { deferred }
