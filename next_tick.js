var loop = require('./loop');

loop.nextTick(function() {
  console.log("will this run first ....");
})

console.log("or this first?");
loop.run();
