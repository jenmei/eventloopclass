var syscalls = require('syscalls');

var readables = {}; // {fd: callback}
var writables = {}; // {fd: callback}

// public API of eventloop module
exports.on = function() {
  if(event == 'read') {
    readables[fd] = callback;
  } else {
    writables[fd] = callback;
  }

}

exports.remove = function(fd, event) {
  if (event == 'read') {
    delete readables[fd];
  } else {
    delete writables[fd];
  }
}

var timers = [];
var timer = 0;
// loop.in(3, function () {...})
exports.in = function (sec, callback) {
  timers.push({ timeout: timer + sec, callback: callback});
}


exports.run = function() {
while (true) {
  var fds = syscalls.select(Object.keys(readables), Object.keys(writables), [], 1);

  timer += 1;
  for (var i=0; i < timers.length; i++) {
    if (timers[i].timeout >= timer) {
      timers[i].callback();
      timers.splice(i, 1);
    }
  }

  // fds = [
  //   [readables]
  //   [writables]
  //   [errors]
  // ]

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

}
