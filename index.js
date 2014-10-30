(function() {
    'use strict';

    var Transform, moment, sessionLog, util;

    Transform = require('stream').Transform;
    util = require('util');
    moment = require('moment');
    sessionLog = process.stdout;

    module.exports = function() {
      var black, blue, bold, color, cyan, green, magenta, origPush, red, stream, white, yellow;
      color = require('ansi-color').set;
      bold = function(value) {
        return color(value, 'bold');
      };
      black = function(value) {
        return color(value, 'black');
      };
      red = function(value) {
        return color(value, 'red');
      };
      green = function(value) {
        return color(value, 'green');
      };
      yellow = function(value) {
        return color(value, 'yellow');
      };
      blue = function(value) {
        return color(value, 'blue');
      };
      magenta = function(value) {
        return color(value, 'magenta');
      };
      cyan = function(value) {
        return color(value, 'cyan');
      };
      white = function(value) {
        return color(value, 'white');
      };
      stream = new Transform({
        objectMode: true
      });
      origPush = stream.push;
      stream.push = function(value) {
        return origPush.call(this, value + ' ');
      };
      stream._transform = function(data, encoding, callback) {
        var chunk, colorFn, str, strChunk, time, _ref, _ref1;
        time = moment().format("YYYY/MM/DD HH:mm:ss Z");
        if (data.chunk) {
          chunk = data.chunk;
        } else {
          chunk = data;
        }
        if ((_ref = data.type) === 'C->S' || _ref === 'S->C') {
          strChunk = JSON.stringify(chunk);
          if (data.type === 'C->S') {
            colorFn = green;
          } else {
            colorFn = cyan;
          }
          str = yellow("" + time + " ") + colorFn("" + data.client.id + " " + data.type + " " + strChunk + "\n");
          sessionLog.write(str);
        }
        stream.push(white(time));
        if ((_ref1 = data.client) != null ? _ref1.id : void 0) {
          stream.push(yellow(data.client.id));
        }
        if (data.type === 'C->S') {
          stream.push(bold(cyan(data.type)));
        } else if (data.type === 'S->C') {
          stream.push(bold(blue(data.type)));
        } else {
          stream.push(bold(magenta('*S*')));
        }
        if (chunk != null ? chunk.a : void 0) {
          stream.push(magenta(chunk.a));
        }
        if (chunk != null ? chunk.c : void 0) {
          stream.push(green(chunk.c));
        }
        if (chunk != null ? chunk.doc : void 0) {
          stream.push(green(chunk.doc));
        }
        if (chunk != null ? chunk.id : void 0) {
          stream.push(green(chunk.id));
        }
        if (chunk != null ? chunk.q : void 0) {
          stream.push(green(util.inspect(chunk.q, {
            depth: null
          })));
        }
        if ((chunk != null ? chunk.data : void 0) && chunk.a !== 'qsub' && chunk.a !== 'qfetch') {
          stream.push(green(util.inspect(chunk.data, {
            depth: 2
          })));
        }
        if (chunk != null ? chunk.op : void 0) {
          stream.push(green(util.inspect(chunk.op, {
            depth: null
          })));
        }
        if (chunk != null ? chunk.create : void 0) {
          stream.push(white('[Create] ' + util.inspect(chunk.create, {
            depth: null
          })));
        }
        if (chunk != null ? chunk.del : void 0) {
          stream.push(white('[DELETE]'));
        }
        if (chunk != null ? chunk.extra : void 0) {
          stream.push(green(util.inspect(chunk.extra, {
            depth: 2
          })));
        }
        stream.push('\n');
        return callback();
      };
      return stream;
    };

}).call(this);
