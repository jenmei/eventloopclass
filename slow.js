var http = require('http');

// NOTE: We're now using Node.js builtin event loop. NOT the loop we built in loop.js

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  if (req.url == "/slow") {
    var objects = [];
    
    var i=0;
    function compute() {
      // for (var j=0; j < 10000; j++, i++) {
        objects.push(new Object()); // pretend we're computing something here
      // };
      
      if (i < 10000000) {
        i++;
        process.nextTick(compute);
      } else {
        res.end("slow request done");
      }
    }
    compute();
        
  } else {
    res.end("fast request done");
    
  }
}).listen(3000);