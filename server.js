var syscalls = require('syscalls');

var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

syscalls.bind(fd, 3000, "0.0.0.0");

syscalls.listen(fd, 100);

console.log("Listening on port 3000");

var readables = {}; // {fd: callback}
var writables = {}; // {fd: callback}

readables[fd] = function () {
  var connFd = syscalls.accept(fd);
  syscalls.fcntl(connFd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
  console.log("Accepted new connection");

  readables[connFd] = function () {
    var data = syscalls.read(connFd, 1024);
    console.log("Received: " + data);
    delete readables[connFd];

    writables[connFd] = function () {
      syscalls.write(connFd, "bye!\n");
      syscalls.close(connFd);
      delete writeables[connFd];
    }
  }

}

while (true) {
  // fds = [[readables], [writables], [errors]];
  var fds = syscalls.select(Object.keys(readables), Object.keys(writables), [], 0);

  var readableFds = fds[0];
  var writableFds = fds[1];

  for (var i=0; i< readableFds.length; i++) {
    var fd = readableFds[i];
    var callback = readables[fd];
    callback();
  }

  for (var i=0; i< writables.length; i++) {
    var fd = writableFds[i];
    var callback = writables[fd];
    callback();
  }
}





