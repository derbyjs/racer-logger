var Transform = require('stream').Transform;
var util = require('util');
var color = require('ansi-color').set;

module.exports = function(store) {
  loggerStream = createStream();
  loggerStream.pipe(process.stdout);
  store.logger = loggerStream;
};

function createStream() {
  var stream = new Transform({objectMode: true});
  function push(value) {
    stream.push(value + ' ');
  }

  stream._transform = function(data, encoding, callback) {
    if (!data) return callback();

    var time = new Date().toISOString().replace('T', ' ').slice(0, 19) + 'Z';
    push(white(time));

    var chunk = data.chunk || data;
    if (typeof chunk === 'string') {
      try {
        chunk = JSON.parse(chunk);
      } catch (err) {}
    }

    directionColor = (data.type === 'C->S') ? magenta : blue;
    // Client to Server or vice versa
    if (data.type) {
      push(directionColor(bold(data.type)));
    }
    if (data.client && chunk.a === 'init' && chunk.id) {
      data.client.__src = chunk.id;
    }
    if (data.src) {
      push(directionColor(data.src));
    } else if (data.client && data.client.__src) {
      push(directionColor(data.client.__src));
    }
    if (data.client && data.client.id) {
      push(directionColor(data.client.id));
    }
    // Action
    if (chunk.a) {
      push(directionColor(chunk.a));
    }
    if (chunk.src) {
      push(yellow(chunk.src));
    }
    if (chunk.seq) {
      push(yellow(chunk.seq));
    }
    // Collection
    if (chunk.c) {
      push(cyan(chunk.c));
    }
    // Doc id
    if (chunk.d) {
      push(cyan(chunk.d));
    }
    // Id of query
    if (chunk.id && chunk.a !== 'init') {
      push(cyan(chunk.id));
    }
    // Query parameters
    if (chunk.q) {
      push(green(util.inspect(chunk.q, {depth: null})));
    }
    if (chunk.diff) {
      push(green(util.inspect(chunk.diff, {depth: 2})));
    }
    // Bulk subscribe parameters
    if (chunk.s) {
      push(green(util.inspect(chunk.s, {depth: null})));
    }
    // Data being sent
    if (chunk.data) {
      if (chunk.a === 'qsub' || chunk.a === 'qfetch') {
        push(green('- results: ' + chunk.data.length));
      } else {
        push(green('- version: ' + chunk.data.v));
      }
    }
    // Document mutation
    if (chunk.op) {
      push(green(util.inspect(chunk.op, {depth: null})));
    }
    // Document creation
    if (chunk.create) {
      push(green('[create] ' + util.inspect(chunk.create, {depth: null})));
    }
    // Document deletion
    if (chunk.del) {
      push(green('[delete]'));
    }
    // Query extra
    if (chunk.extra) {
      push(green(util.inspect(chunk.extra, {depth: 1})));
    }
    // End of message
    stream.push('\n');
    callback();
  };
  return stream;
}

function bold(value) {
  return color(value, 'bold');
}
function red(value) {
  return color(value, 'red');
}
function green(value) {
  return color(value, 'green');
}
function yellow(value) {
  return color(value, 'yellow');
}
function blue(value) {
  return color(value, 'blue');
}
function magenta(value) {
  return color(value, 'magenta');
}
function cyan(value) {
  return color(value, 'cyan');
}
function white(value) {
  return color(value, 'white');
}
