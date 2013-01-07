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
    var meta = new AutomaticProtocolSequencer(e);
    meta.setProtocols([new ShoutPlus(meta), new DFTraversal(meta)]);
    e.setProtocolEvents(meta);
  });
  Node.logEnabled = true;
  nodes[0].initiate(function() {
    console.log("Done!");
  });
}
