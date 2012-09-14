var syscalls = require('syscalls');
var loop = require('./loop');

var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

syscalls.bind(fd, 3000, "0.0.0.0");

syscalls.listen(fd, 100);

console.log("Listening on port 3000");

loop.on(fd, 'read', function() {
  var connFd = syscalls.accept(fd);
  syscalls.fcntl(connFd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
  console.log("Accepted new connection");
  
  loop.on(connFd, 'read', function() {
    var data = syscalls.read(connFd, 1024);
    console.log("Received: " + data);
    loop.remove(connFd, 'read');
  
    loop.on(connFd, 'write', function() {
      syscalls.write(connFd, "bye!\n");

      syscalls.close(connFd);
      loop.remove(connFd, 'write');
    });
  });
});

loop.run();