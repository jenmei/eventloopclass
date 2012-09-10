var syscalls = require('syscalls');

var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
syscalls.bind(fd, 3000, "0.0.0.0");
syscalls.listen(fd, 100);

var readables = {}; // { fd: callback }

readables[fd] = function() {
  var connFd = syscalls.accept(fd);
  
  readables[connFd] = function() {
    var data = syscalls.read(connFd, 100);
    console.log(data);

    syscalls.close(connFd);
    delete readables[connFd];
  };
};

while (1) {
  var fds = syscalls.select(Object.keys(readables), [], [], 0);
  
  var readableFds = fds[0];
  
  for (var i=0; i < readableFds.length; i++) {
    var fd = readableFds[i];
    var callback = readables[fd];
    callback();
  };
}