function Saturation(container) {
  this.container = container;
  this.state = "available";
  this.parent = null;
  this.neighbors = null;
}

Saturation.prototype = {
  onInitiate: function() {
    // Will not work in case if the initiator is the only node in the tree.
    this.start();
  },

  onReceive: function(src, message) {
    switch (this.state) {
    case "available":
      if (message === "activate") {
        this.start(src);
      }
      break;
    case "active":
      if (message === "saturation") {
        this.processMessage();
        this.neighbors = this.neighbors.filter(
          function (e) { return e !== src; }
        );
        this.becomeProcessingIfLeaf();
      }
      break;
    case "processing":
      switch (message) {
      case "saturation":
        this.processMessage();
        // fall through
      case "resolution":
        this.container.getNeighbors().forEach(function (e) {
          if (e !== this.parent) {
            this.container.send(e, "resolution");
          }
        }, this);
        this.state = "done";
        this.container.done();
        break;
      }
      break;
    }
  },

  initialize: function() {
    Node.log(this.container.container, "initialize");
  },

  prepareMessage: function() {
    Node.log(this.container.container, "prepareMessage");
  },

  processMessage: function() {
    Node.log(this.container.container, "processMessage");
  },

  becomeProcessingIfLeaf: function() {
    if (this.neighbors.length === 1) {
      this.prepareMessage();
      this.parent = this.neighbors[0];
      this.container.send(this.parent, "saturation");
      this.state = "processing";
    }
  },

  start: function(parent) {
    this.container.getNeighbors().forEach(function (e) {
      if (e !== parent) {
        this.container.send(e, "activate");
      }
    }, this);
    this.initialize();
    this.neighbors = this.container.getNeighbors();
    if (!this.becomeProcessingIfLeaf()) {
      this.state = "active";
    }
  }
};

function runSimulation() {
  //
  //     [0]--[3]
  //    /   \
  //  [1]---[2]
  //
  var nodes = Node.createNodes(4);
  nodes[0].neighbors.push(nodes[1], nodes[2], nodes[3]);
  nodes[1].neighbors.push(nodes[0], nodes[2]);
  nodes[2].neighbors.push(nodes[0], nodes[1]);
  nodes[3].neighbors.push(nodes[0]);
  nodes.forEach(function (e) {
    var meta = new ProtocolSequencer(e);
    meta.setProtocols([new ShoutPlus(meta), new Saturation(meta)]);
    e.setProtocolEvents(meta);
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    nodes[0].initiate(function() {
      console.log("0 Done!");
    });
    nodes[1].initiate(function() {
      console.log("1 Done!");
    });
    nodes[2].initiate(function() {
      console.log("2 Done!");
    });
    nodes[3].initiate(function() {
      console.log("3 Done!");
    });
  });
}
