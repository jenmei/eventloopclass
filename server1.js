var syscalls = require('syscalls');

var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

syscalls.bind(fd, 3000, "0.0.0.0");

syscalls.listen(fd, 100);

while (1) {
  syscalls.select([fd], [], [], 0);
  var connFd = syscalls.accept(fd);
  
  syscalls.select([connFd], [], [], 0);
  var data = syscalls.read(connFd, 100);
  console.log(data);

  syscalls.select([], [connFd], [], 0);
  syscalls.write(connFd, 'bye!\n');
  
  syscalls.close(connFd);
}