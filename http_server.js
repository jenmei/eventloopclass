var syscalls = require('syscalls');
var loop = require('./loop');
var HTTPParser = require('./http_parser').HTTPParser;

var HttpServer = function(callback) {
  var self = this;
  
  var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
  syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
  syscalls.bind(fd, 3000, "0.0.0.0");
  syscalls.listen(fd, 100);
  
  self.start = function() {
    loop.on(fd, 'read', function() {
      try {
        var connFd = syscalls.accept(fd);
      } catch (e) {
        // Another worker accepted the connection
      }
      if (connFd) {
        syscalls.fcntl(connFd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
        new HttpServer.Connection(connFd, callback);
      }
    })
  };
  
  self.fork = function(count) {
    if (syscalls.fork() == 0) {
      console.log("In child process: " + syscalls.getpid());
      self.start();
    } else {
      console.log("In master process: " + syscalls.getpid());
      count--;
      if (count > 0) this.fork(count);
    }
  };
};

HttpServer.Connection = function(fd, callback) {
  var parser = new HTTPParser(HTTPParser.REQUEST);
  
  loop.on(fd, 'read', function() {
    var data = syscalls.read(fd, 4096);
    parser.parse(data);
  })
  
  parser.onMessageComplete = function() {
    loop.remove(fd, 'read');
    process(parser.info);
  }
  
  function process(request) {
    console.log(request);
    var response = callback(request);
    console.log(response);
    
    sendResponse("HTTP/1.1 200 OK\r\n" +
                 "Content-Type: text/plain\r\n" +
                 "Content-Length: " + response.length + "\r\n" +
                 "\r\n" +
                 response);
  }
  
  function sendResponse(data) {
    loop.on(fd, 'write', function() {
      syscalls.write(fd, data); // TCP_NOPUSH, TCP_CORK
      syscalls.close(fd);
      loop.remove(fd, 'write');
    })
  }
}


var server = new HttpServer(function(request) {
  return "you requested " + request.url +
         " from process: " + syscalls.getpid() + "\n";
});

// server.start();
server.fork(3);

loop.run();