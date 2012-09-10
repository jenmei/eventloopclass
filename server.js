var syscalls = require('syscalls');
var loop = require('./loop');

var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

syscalls.bind(fd, 3000, "0.0.0.0");

syscalls.listen(fd, 100);

loop.on(fd, 'read', function() {
  var connFd = syscalls.accept(fd);
  
  loop.on(connFd, 'read', function() {
    var data = syscalls.read(connFd, 100);
    console.log(data);

    loop.remove(connFd, 'read');
  });
  
  loop.on(connFd, 'write', function() {
    syscalls.write(connFd, "bye!");
    
    syscalls.close(connFd);
    loop.remove(connFd, 'write');
  });
});

loop.run();