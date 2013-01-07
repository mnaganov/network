function DFTraversal(container) {
  this.container = container;
  this.state = "idle";
  this.parent = null;
  this.unvisited = null;
}

DFTraversal.prototype = {
  onInitiate: function() {
    this.unvisited = this.container.getNeighbors();
    this.visit();
  },

  onReceive: function(src, message) {
    switch (this.state) {
    case "idle":
      if (message === "token") {
        this.parent = src;
        this.unvisited = this.container.getNeighbors().filter(
          function (e) { return e !== src; }
        );
        this.visit();
      }
      break;
    case "visited":
      switch (message) {
      case "token":
        this.unvisited = this.unvisited.filter(
          function (e) { return e !== src; }
        );
        this.container.send(src, "backedge");
        break;
      case "return":
      case "backedge":
        this.visit();
        break;
      }
      break;
    }
  },

  visit: function() {
    if (this.unvisited.length) {
      var next = this.unvisited.shift();
      this.container.send(next, "token");
      this.state = "visited";
    } else {
      if (this.parent) {
        this.container.send(this.parent, "return");
      } else {
        this.state = "done";
        this.container.done();
      }
    }
  }
};

function df_runSimulation() {
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
    e.setProtocolEvents(new DFTraversal(e));
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
  });
}
