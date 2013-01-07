function ProtocolEvents() {
}

ProtocolEvents.prototype = {
  onInitiate: function() {
  },

  onReceive: function(src, message) {
  }
};

function ProtocolContainer() {
}

ProtocolContainer.prototype = {
  getNeighbors: function() {
  },

  send: function(dst, message) {
  },

  done: function() {
  }
};

function ProtocolSequencer(container) {
  this.container = container;
  this.protocols = [];
  this.neighbors = this.container.getNeighbors();
}

ProtocolSequencer.prototype = {
  setProtocols: function(protocols) {
    this.protocols = protocols;
  },

  getNeighbors: function() {
    return this.neighbors.concat();
  },

  send: function(dst, message) {
    this.container.send(dst, message);
  },

  done: function() {
    if (this.protocols[0].getNewNeighbors) {
      this.neighbors = this.protocols[0].getNewNeighbors();
    }
    this.protocols.shift();
    if (this.delegateDone()) {
      this.container.done();
    }
  },

  delegateDone: function() {
    return true;
  },

  onInitiate: function() {
    this.protocols[0].onInitiate();
  },

  onReceive: function(src, message) {
    if (this.protocols.length) {
      this.protocols[0].onReceive(src, message);
    }
  }
};

function AutomaticProtocolSequencer(container) {
  ProtocolSequencer.call(this, container);
  this.initiator = false;
}

AutomaticProtocolSequencer.prototype = {
  onInitiate: function() {
    this.initiator = true;
    ProtocolSequencer.prototype.onInitiate.call(this);
  },

  delegateDone: function() {
    if (this.protocols.length) {
      if (this.initiator) {
        window.setTimeout(this.container.invokeInitiate(this.container), 0);
      }
      return false;
    } else {
      return true;
    }
  }
};

AutomaticProtocolSequencer.prototype.__proto__ = ProtocolSequencer.prototype;
