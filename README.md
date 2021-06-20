# promise-impl
Very simple Promises/A+ implementation. Passes all tests from the Promises/A+ spec.

The implementation is called an `Eventual` and can be initialised like a normal `Promise`:
```js
const ev = new Eventual((res, rej) => {
  // ...
})
```

### Scripts
- Run the tests: `yarn test`
