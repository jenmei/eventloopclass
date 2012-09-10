var syscalls = require('syscalls');

var watches = { read: {}, write: {} };
var nextTicks = [];
var timers = [];
var timer = 0;

exports.on = function(fd, state, callback) {
  watches[state][fd] = callback;
};

exports.remove = function(fd, state) {
  delete watches[state][fd];
};

exports.nextTick = function(callback) {
  nextTicks.push(callback);
};

// Timers
exports.in = function(sec, callback) {
  timers.push({ timeout: timer + sec, callback: callback });
};

exports.run = function() {
  while (1) {
    //////////////// nextTick /////////////////////
    for (var i=0; i < nextTicks.length; i++) {
      nextTicks[i]();
    };
    nextTicks = [];
    ///////////////////////////////////////////////
    
    var readables = watches.read;
    var writables = watches.write;
    
    var fds = syscalls.select(Object.keys(readables),
                              Object.keys(writables), [], 1);
    
    ///////////////////// timers ///////////////////
    timer += 1;
    for (var i=0; i < timers.length; i++) {
      if (timers[i].timeout >= timer) {
        timers[i].callback()
        timers.splice(i, 1);
      }
    };
    ///////////////////////////////////////////////

    var readableFds = fds[0];
    var writableFds = fds[1];

    for (var i=0; i < readableFds.length; i++) {
      var fd = readableFds[i];
      var callback = readables[fd];
      callback();
    };
    for (var i=0; i < writableFds.length; i++) {
      var fd = writableFds[i];
      var callback = writables[fd];
      callback();
    };
  }
};