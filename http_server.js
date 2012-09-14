var syscalls = require('syscalls');
var loop = require('./loop');
var HTTPParser = require('./http_parser').HTTPParser;

var HttpServer = function(callback) {
  var self = this;

  var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

  syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

  syscalls.bind(fd, 3000, '0.0.0.0');
  syscalls.listen(fd, 100);

  self.start = function () {
    loop.on(fd, 'read', function () {
      var connFd = syscalls.accept(fd);
      syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
      new HttpServer.Connection(connFd, callback);
    });
    syscalls.accept(fd);
  }
}

HttpServer.Connection = function(fd, callback) {
  var parser= new HTTPParser(HTTPParser.RESPONSE);

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
    callback(request);
    console.log(response);
  }
}

var server = new HttpServer(function(request) { 
  return "you returned " + request.url + "\n";
});


server.start();

loop.run();


