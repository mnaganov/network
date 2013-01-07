function TreeCenter(container) {
  this.container = container;
  this.state = "available";
  this.parent = null;
  this.parentIndex = null;
  this.distances = [];
  this.distancesKnown = 0;
}

TreeCenter.prototype = {
  getNeighborIndex: function(node) {
    return this.container.getNeighbors().indexOf(node);
  },

  onInitiate: function() {
    this.container.getNeighbors().forEach(function (e) {
      this.container.send(e, ["activate", 1]);
    }, this);
    if (!this.container.getNeighbors().length) {
      Node.log(this.container, "center");
      this.state = "center";
      this.container.done();
    } else {
      this.state = "active";
    }
  },

  onReceive: function(src, message) {
    switch (this.state) {
    case "available":
      if (message[0] === "activate") {
        this.parent = src;
        this.parentIndex = this.getNeighborIndex(src);
        this.distances[this.parentIndex] = message[1];
        this.distancesKnown = 1;
        this.container.getNeighbors().forEach(function (e) {
          if (e !== src) {
            this.container.send(e, ["activate", message[1] + 1]);
          }
        }, this);
        if (this.container.getNeighbors().length === 1) {
          this.container.send(this.container.getNeighbors()[0], ["saturation", message[1]]);
          this.state = "processing";
        } else {
          this.state = "active";
        }
      }
      break;
    case "active":
      if (message[0] === "saturation") {
        if (this.parentIndex !== null) {
          this.distances[this.getNeighborIndex(src)] = message[1] - this.distances[this.parentIndex];
          if (++this.distancesKnown === this.container.getNeighbors().length) {
            var maxDistance = 0;
            for (var i = 0; i < this.distancesKnown; ++i) {
              if (i !== this.parentIndex) {
                var distance = this.distances[i] + this.distances[this.parentIndex];
                if (distance > maxDistance) maxDistance = distance;
              }
            }
            this.container.send(this.parent, ["saturation", maxDistance]);
            this.state = "processing";
          }
        } else {
          this.distances[this.getNeighborIndex(src)] = message[1];
          if (++this.distancesKnown === this.container.getNeighbors().length) {
            this.container.getNeighbors().forEach(function (e) {
              var maxDistance = 0, neigborIndex = this.getNeighborIndex(e);
              for (var i = 0; i < this.distances.length; ++i) {
                if (i !== neigborIndex && this.distances[i] > maxDistance) maxDistance = this.distances[i];
              }
              this.container.send(e, ["resolution", maxDistance]);
            }, this);
            this.distancesKnown = 0;

            var sortedDistances = this.distances.concat();
            sortedDistances.sort(function(a, b) { return b - a; });
            var second = sortedDistances.length > 1 ? sortedDistances[1] : 0;
            this.state = sortedDistances[0] - second <= 1 ? "center" : "not-center";
            if (this.state === "center") {
              Node.log(this.container, "center");
            }
          }
        }
      }
      break;
    case "processing":
      if (message[0] === "resolution") {
        this.distances[this.parentIndex] = message[1] + 1;

        this.container.getNeighbors().forEach(function (e) {
          if (e !== src) {
            var maxDistance = 0, neigborIndex = this.getNeighborIndex(e);
            for (var i = 0; i < this.distances.length; ++i) {
              if (i !== neigborIndex && this.distances[i] > maxDistance) maxDistance = this.distances[i];
            }
            this.container.send(e, ["resolution", maxDistance]);
          }
        }, this);

        var sortedDistances = this.distances.concat();
        sortedDistances.sort(function(a, b) { return b - a; });
        var second = sortedDistances.length > 1 ? sortedDistances[1] : 0;
        this.state = sortedDistances[0] - second <= 1 ? "center" : "not-center";
        if (this.state === "center") {
          Node.log(this.container, "center");
        }
        this.distancesKnown = 1;

        if (this.container.getNeighbors().length === 1) {
          this.container.send(this.container.getNeighbors()[0], ["resolution"]);
        }
      }
      break;
    case "center":
    case "not-center":
      if (message[0] === "resolution") {
        if (++this.distancesKnown === this.container.getNeighbors().length) {
          if (this.parent) {
            this.container.send(this.parent, ["resolution"]);
          } else {
            this.container.done();
          }
        }
      }
      break;
    }
  }
};

function runSimulation() {
  // [0]
  var nodes = Node.createNodes(1);
  nodes.forEach(function (e) {
    e.setProtocolEvents(new TreeCenter(e));
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
    window.setTimeout(phase2, 0);
  });
}

function phase2() {
  // [0]--[1]
  var nodes = Node.createNodes(2);
  nodes[0].neighbors.push(nodes[1]);
  nodes[1].neighbors.push(nodes[0]);
  nodes.forEach(function (e) {
    e.setProtocolEvents(new TreeCenter(e));
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
    window.setTimeout(phase3, 0);
  });
}

function phase3() {
  // [0]--[1]--[2]
  var nodes = Node.createNodes(3);
  nodes[0].neighbors.push(nodes[1]);
  nodes[1].neighbors.push(nodes[0], nodes[2]);
  nodes[2].neighbors.push(nodes[1]);
  nodes.forEach(function (e) {
    e.setProtocolEvents(new TreeCenter(e));
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
    window.setTimeout(phase4, 0);
  });
}

function phase4() {
  // [0]--[1]--[2]--[3]
  var nodes = Node.createNodes(4);
  nodes[0].neighbors.push(nodes[1]);
  nodes[1].neighbors.push(nodes[0], nodes[2]);
  nodes[2].neighbors.push(nodes[1], nodes[3]);
  nodes[3].neighbors.push(nodes[2]);
  nodes.forEach(function (e) {
    e.setProtocolEvents(new TreeCenter(e));
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
    window.setTimeout(phase5, 0);
  });
}

function phase5() {
  // [0]--[1]--[3]
  //       |
  //      [2]
  var nodes = Node.createNodes(4);
  nodes[0].neighbors.push(nodes[1]);
  nodes[1].neighbors.push(nodes[0], nodes[2], nodes[3]);
  nodes[2].neighbors.push(nodes[1]);
  nodes[3].neighbors.push(nodes[1]);
  nodes.forEach(function (e) {
    e.setProtocolEvents(new TreeCenter(e));
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
    window.setTimeout(phase6, 0);
  });
}

function phase6() {
  // [0]--[1]--[3]--[4]
  //       |
  //      [2]
  var nodes = Node.createNodes(5);
  nodes[0].neighbors.push(nodes[1]);
  nodes[1].neighbors.push(nodes[0], nodes[2], nodes[3]);
  nodes[2].neighbors.push(nodes[1]);
  nodes[3].neighbors.push(nodes[1], nodes[4]);
  nodes[4].neighbors.push(nodes[3]);
  nodes.forEach(function (e) {
    e.setProtocolEvents(new TreeCenter(e));
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
    window.setTimeout(phase7, 0);
  });
}

function phase7() {
  //      [1]
  //       |
  // [2]--[0]--[4]
  //       |
  //      [3]
  var nodes = Node.createNodes(5);
  nodes[0].neighbors.push(nodes[1], nodes[2], nodes[3], nodes[4]);
  nodes[1].neighbors.push(nodes[0]);
  nodes[2].neighbors.push(nodes[0]);
  nodes[3].neighbors.push(nodes[0]);
  nodes[4].neighbors.push(nodes[0]);
  nodes.forEach(function (e) {
    e.setProtocolEvents(new TreeCenter(e));
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
    window.setTimeout(phase8, 0);
  });
}

function phase8() {
  //      [1]
  //       |
  // [2]--[0]--[4]--[5]--[6]--[7]--[8]--[9]
  //       |                   |
  //      [3]                 [10]
  var nodes = Node.createNodes(11);
  nodes[0].neighbors.push(nodes[1], nodes[2], nodes[3], nodes[4]);
  nodes[1].neighbors.push(nodes[0]);
  nodes[2].neighbors.push(nodes[0]);
  nodes[3].neighbors.push(nodes[0]);
  nodes[4].neighbors.push(nodes[0], nodes[5]);
  nodes[5].neighbors.push(nodes[4], nodes[6]);
  nodes[6].neighbors.push(nodes[5], nodes[7]);
  nodes[7].neighbors.push(nodes[6], nodes[8], nodes[10]);
  nodes[8].neighbors.push(nodes[7], nodes[9]);
  nodes[9].neighbors.push(nodes[8]);
  nodes[10].neighbors.push(nodes[7]);
  nodes.forEach(function (e) {
    e.setProtocolEvents(new TreeCenter(e));
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
  });
}
