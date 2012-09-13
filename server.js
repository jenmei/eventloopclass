var syscalls = require('syscalls');

// first arg is domain, af_inet == ipv4, AF_LOCAL == unix domain socket (local) AF_INET6 == ipv6)
// second arg is for type of socket we want to create (tcp, udp, etc. sock_stream == tcp)
// third arg is protocol specific to the type in arg2. generally this is going to be 0
// man 2 socket
var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

syscalls.bind(fd, 3000, "0.0.0.0");

// second arg is backlog, the number of incoming connections in oerating system queue
// zero based so 100 is 101
syscalls.listen(fd, 100);

console.log("listening on port 3000");

while(true) {
  // remote socket; other is listening socket
  var connFd = syscalls.accept(fd);
  console.log("Accepted new connection");

  var data = syscalls.read(connFd, 1);
  console.log("Received: " + data);

  syscalls.write(connFd, "bye!\n");

  // can check out SO_LINGER for closing options and remaining buffer
  syscalls.close(connFd);
}
