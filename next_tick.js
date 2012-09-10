var loop = require('./loop');

// process.nextTick(function() {
//   console.log("Will this print first ...");
// });
// console.log("or this ?");

loop.nextTick(function() {
  console.log("Will this print first ...");
});
console.log("or this ?");

loop.run();