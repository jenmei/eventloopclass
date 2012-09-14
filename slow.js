var http = require('http');

// NOTE: We're now using Node.js builtin event loop. NOT the loop we built in loop.js



http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  if (req.url == "/slow") {
    var objects = [];
    var compute = function(numLeft) {
      if (numLeft > 0) {
        objects.push(new Object());
        process.nextTick(function () {
          compute(numLeft - 1);
        });
      } else {
        res.end("slow request done");
      }
    }
    process.nextTick(function () {
      compute(10000000, res)
    });
  } else {
    res.end("fast request done");
  }
}).listen(3000);
