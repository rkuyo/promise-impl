# promise-impl
Promises/A+ implementation focused on simplicity and readability. Passes all tests from the Promises/A+ spec.

The implementation is called an `Eventual` and can be initialised like a normal `Promise`:
```js
const ev = new Eventual((res, rej) => {
  // ...
})
```

### Scripts
- Run the tests: `yarn test`
