function Node() {
  this.neighbors = [];
  this.messageQueue = [];
  this.onDone = null;
  this.protocolEvents = null;
  this.insideProtocol = false;
}

Node.logEnabled = false;

Node.createNodes = function(count) {
  Node.nodes = new Array(count);
  for (var i = 0; i < count; ++i) {
    Node.nodes[i] = new Node();
  }
  return Node.nodes;
};

Node.log = function() {
  if (!Node.logEnabled) return;
  var logArgs = Array.prototype.map.call(arguments, function(e) {
    return e !== null && Node.nodes && e.__proto__ === Node.prototype ? Node.nodes.indexOf(e) : e;
  });
  console.log.apply(console, logArgs);
};

Node.prototype = {
  setProtocolEvents: function(protocolEvents) {
    this.protocolEvents = protocolEvents;
  },

  initiate: function(doneCallback) {
    Node.log(this, "initiate");
    this.onDone = doneCallback;
    this.invokeInitiate();
  },

  invokeInitiate: function() {
    this.invokeProtocolEvent(this.protocolEvents.onInitiate);
  },

  invokeProtocolEvent: function(protocolEvent) {
    this.insideProtocol = true;
    protocolEvent.apply(this.protocolEvents, Array.prototype.slice.call(arguments, 1));
    this.insideProtocol = false;
    this.processMessages();
  },

  getNeighbors: function() {
    return this.neighbors.concat();
  },

  send: function(dst, message) {
    dst.receive(this, message);
  },

  receive: function(src, message) {
    if (!this.insideProtocol) {
      Node.log(src, "->", this, message);
      this.invokeProtocolEvent(this.protocolEvents.onReceive, src, message);
    } else {
      this.messageQueue.push(src, message);
    }
  },

  done: function() {
    if (this.onDone) {
      this.onDone.apply(null, Array.prototype.slice.call(arguments, 1));
    }
  },

  processMessages: function() {
    if (this.messageQueue.length) {
      var src = this.messageQueue.shift();
      var message = this.messageQueue.shift();
      window.setTimeout(this.receive.bind(this, src, message), 0);
    }
  }
};
