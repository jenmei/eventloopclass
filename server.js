var syscalls = require('syscalls');

var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

// man 2 fcntl for more info;
// Changing it to a non-blocking socket;
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

syscalls.bind(fd, 3000, "0.0.0.0");

syscalls.listen(fd, 100);

console.log("Listening on port 3000");

while (true) {
  // io multiplexing ... taking multiple signals and turning them into one.
  // blocking call until fd is available for reading.
  // read fd, write fd, error fd, timeout (0 means no timeout) 
  // seelct is most portable but slowest. poll, epoll (linux), kqueue (bsd, mac os x).
  syscalls.select([fd], [], [], 0);
  var connFd = syscalls.accept(fd);
  console.log("Accepted new connection");

  syscalls.select([connFd], [], [], 0);
  var data = syscalls.read(connFd, 1024);
  console.log("Received: " + data);

  syscalls.select([], [connFd], [], 0);
  syscalls.write(connFd, "bye!\n");

  syscalls.close(connFd);
}
