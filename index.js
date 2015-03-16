var Transform = require('stream').Transform;
var util = require('util');
var moment = require('moment');
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
    var chunk = (data.chunk) ? data.chunk : data;
    var time = moment().format('YYYY/MM/DD HH:mm:ss Z');
    push(white(time));

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
    if (chunk && chunk.a) {
      push(magenta(chunk.a));
    }
    // Collection
    if (chunk && chunk.c) {
      push(green(chunk.c));
    }
    // Doc id
    if (chunk && chunk.doc) {
      push(green(chunk.doc));
    }
    // Id of subscription/query
    if (chunk && chunk.id) {
      push(green(chunk.id));
    }
    // Query parameters
    if (chunk && chunk.q) {
      push(green(util.inspect(chunk.q, {
        depth: null
      })));
    }
    // Data being sent
    if (chunk && chunk.data && chunk.a !== 'qsub' && chunk.a !== 'qfetch') {
      push(green(util.inspect(chunk.data, {depth: 2})));
    }
    // Document mutation
    if (chunk && chunk.op) {
      push(green(util.inspect(chunk.op, {depth: null})));
    }
    // Document creation
    if (chunk && chunk.create) {
      push(white('[Create] ' + util.inspect(chunk.create, {depth: null})));
    }
    // Document deletion
    if (chunk && chunk.del) {
      push(white('[Delete]'));
    }
    // Query extra
    if (chunk && chunk.extra) {
      push(green(util.inspect(chunk.extra, {depth: 2})));
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
