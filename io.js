var syscalls = require('syscalls');

var data = syscalls.read(0, 10);
console.log("You typed: " + data);

// EXERCISE
syscalls.write(1, 'yo\n');