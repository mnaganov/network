function ShoutPlus(container) {
  this.container = container;
  this.state = "idle";
  this.parent = null;
  this.treeNeighbors = [];
  this.messagesCount = 0;
}

ShoutPlus.prototype = {
  getNewNeighbors: function() {
    return this.treeNeighbors.concat();
  },

  onInitiate: function() {
    this.container.getNeighbors().forEach(function (e) {
      this.container.send(e, "Q");
    }, this);
    this.state = "active";
  },

  onReceive: function(src, message) {
    switch (this.state) {
    case "idle":
      if (message === "Q") {
        this.parent = src;
        this.treeNeighbors = [src];
        this.container.send(src, "Yes");
        this.messagesCount = 1;
        if (this.messagesCount === this.container.getNeighbors().length) {
          this.state = "done";
          this.container.done();
        } else {
          this.container.getNeighbors().forEach(function (e) {
            if (e !== src) {
              this.container.send(e, "Q");
            }
          }, this);
          this.state = "active";
        }
      }
      break;
    case "active":
      switch (message) {
      case "Yes":
        this.treeNeighbors.push(src);
        // fall through
      case "Q":
        if (++this.messagesCount === this.container.getNeighbors().length) {
          this.state = "done";
          this.container.done();
        }
        break;
      }
      break;
    }
  }
};

function sp_runSimulation() {
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
    e.setProtocolEvents(new ShoutPlus(e));
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
  });
}
