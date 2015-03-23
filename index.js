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

    var time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    push(white(time));

    var chunk = data.chunk || data;
    if (typeof chunk === 'string') {
      try {
        chunk = JSON.parse(chunk);
      } catch (err) {}
    }

    // Session client id
    if (data.client && data.client.id) {
      push(yellow(data.client.id));
    }
    // Client to Server or vice versa
    if (data.type === 'C->S') {
      push(bold(cyan(data.type)));
    } else if (data.type === 'S->C') {
      push(bold(blue(data.type)));
    } else {
      push(bold(magenta('*S*')));
    }
    // Action
    if (chunk.a) {
      push(magenta(chunk.a));
    }
    // Collection
    if (chunk.c) {
      push(green(chunk.c));
    }
    // Doc id
    if (chunk.d) {
      push(green(chunk.d));
    }
    // Id of query
    if (chunk.id) {
      push(green(chunk.id));
    }
    // Query parameters
    if (chunk.q) {
      push(green(util.inspect(chunk.q, {depth: null})));
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
      push(white('[Create] ' + util.inspect(chunk.create, {depth: null})));
    }
    // Document deletion
    if (chunk.del) {
      push(white('[Delete]'));
    }
    // Query extra
    if (chunk.extra) {
      push(green(util.inspect(chunk.extra, {depth: 1})));
    }
    // End of message
    push('\n');
    callback();
  };
  return stream;
}

function bold(value) {
  return color(value, 'bold');
}
function black(value) {
  return color(value, 'black');
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
