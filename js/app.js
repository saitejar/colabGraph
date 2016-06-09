var client_id = "";
var merged_nodes;
var merged_links;

var nodes = [
    ],
    lastNodeId = -1, // GCounter.
    links = [
        //{source: nodes[0], target: nodes[1], left: false, right: true }
    ];


$(document).ready(function() {
  // console.log('On page load!');
    $.ajax({
    url: "http://localhost:5000/client/new",
    type: "get", //send it through get method
    success: function(response) {
      //console.log('Client ID reseived');
      // c/onsole.log(client_id);
      client_id = response['client_id'];

      $.ajax({
        url: "http://localhost:5000/set/twop/new",
        type: "get", //send it through get method
        data: {
          client_id: client_id,
          key: "nodes"
        },
        success: function(response) {
          // console.log(response)
        },
        error: function(xhr) {
        }
      });

      $.ajax({
        url: "http://localhost:5000/set/twop/new",
        type: "get", //send it through get method
        data: {
          client_id: client_id,
          key: "links"
        },
        success: function(response) {
          // console.log(response);
        },
        error: function(xhr) {
        }
      });
    },
    error: function(xhr) {
    }
  });
});

window.setInterval(function(){
  // console.log("Called every 5 seconds");
  nodesAndLinksStr = convertNodesAndLinksToString();

  $.ajax({
    url: "http://localhost:5000/set/twop/set",
    type: "get", //send it through get method
    data: {
      client_id: client_id,
      key:"nodes",
      add_items: nodesAndLinksStr[0],
      delete_items: nodesAndLinksStr[1]
    },
    success: function(response) {
        console.log('Sent Nodes!');
        $.ajax({
            url: "http://localhost:5000/set/twop/set",
            type: "get", //send it through get method
            data: {
                client_id: client_id,
                key:"links",
                add_items: nodesAndLinksStr[2],
                delete_items: nodesAndLinksStr[3]
            },
            success: function(response) {
                console.log('Sent Links!');
                $.ajax({
                    url: "http://localhost:5000/set/twop/get",
                    type: "get",
                    data: {
                        client_id: client_id,
                        key: "nodes"
                    },
                    success: function(response) {
                        console.log('Got nodes!');
                        nodes_temp = response['set'];
                        for(var i = 0; i < nodes_temp.length; i++) {
                            nodes_temp[i] = JSON.parse(nodes_temp[i]);
                            checkNodeFlag = false;
                            for(var j = 0; j < nodes.length; j++) {
                                if(nodes[j]["id"] == nodes_temp[i]["id"]) {
                                    checkNodeFlag = true;
                                    break;
                                }
                            }
                            if(!checkNodeFlag) {
                                nodes.push(nodes_temp[i]);
                            }
                        }

                        for(var i = 0; i < nodes.length; i++) {
                            var foundFlag = false;
                            for(var j = 0; j < nodes_temp.length; j++) {
                                if(nodes[i]["id"] == nodes_temp[j]["id"]) {
                                    foundFlag = true;
                                    break;
                                }
                            }
                            if(!foundFlag) {
                                spliceLinksForNode(nodes[i]);
                                nodes.splice(i, 1);
                            }
                        }
                        restart();
                        $.ajax({
                            url: "http://localhost:5000/set/twop/get",
                            type: "get",
                            data: {
                                client_id: client_id,
                                key: "links"
                            },
                            success: function (response) {
                                console.log('Got links!');
                                // console.log(response);
                                links_temp = response['set'];
                                if(links_temp == 'undefined') {
                                    return;
                                }
                                for(var i = 0; i < links_temp.length; i++) {
                                    links_temp[i] = JSON.parse(links_temp[i]);
                                    checkLinkFlag = false;
                                    for(var j = 0; j < links.length; j++) {
                                        if(links[j]['left'] == links_temp[i]['left'] &&
                                            links[j]['right'] == links_temp[i]['right'] &&
                                            links[j]['source']['id'] == links_temp[i]['source']['id'] &&
                                            links[j]['target']['id'] == links_temp[i]['target']['id']) {
                                            checkLinkFlag = true;
                                            break;
                                        }
                                    }
                                    if(!checkLinkFlag) {
                                        for(var j = 0; j < nodes.length; j++) {
                                            if(links_temp[i]['source']['id'] == nodes[j]['id']) {
                                                links_temp[i]['source'] = nodes[j];
                                            }
                                            if(links_temp[i]['target']['id'] == nodes[j]['id']) {
                                                links_temp[i]['target'] = nodes[j];
                                            }
                                        }
                                        console.log("Links Gotten");
                                        console.log(links_temp[i]);
                                        links.push(links_temp[i]);
                                    }
                                }
                                // console.log(nodes);
                                console.log("Current Links");
                                console.log(links);
                                restart();
                            },
                            error: function (xhr) {
                                console.log(xhr);
                            }
                        });
                    },
                    error: function(xhr) {
                        console.log(xhr);
                    }
                });

            },
            error: function(xhr) {
            }
        });
    },
    error: function(xhr) {
      console.log("shit!");
    }
  });



  // $.ajax({
  //   url: "http://localhost:5000/set/twop/get",
  //   type: "get", //send it through get method
  //   data: {
  //     client_id: client_id,
  //     key:"nodes",
  //   },
  //   success: function(response) {
  //     // console.log('This is the nodes set!');
  //     // console.log(response);
  //       merged_nodes = [];
  //       for(var i in response['set']){
  //           var node_temp = JSON.parse(response['set'][i]);
  //           node_temp['px'] = 0;
  //           node_temp['py'] = 0;
  //           node_temp['x'] = 0;
  //           node_temp['y'] = 0;
  //           node_temp['weight'] = 1;
  //           merged_nodes.push(node_temp);
  //       }
  //       $.ajax({
  //           url: "http://localhost:5000/set/twop/get",
  //           type: "get", //send it through get method
  //           data: {
  //               client_id: client_id,
  //               key:"links",
  //           },
  //           success: function(response) {
  //               // console.log('This is the links set!');
  //               // console.log(response);
  //               merged_links = [];
  //               for(var i in response['set']){
  //                   var link_temp = JSON.parse(response['set'][i]);
  //                   console.log('index=' + getNodeIndex(link_temp['source'], merged_nodes).toString());
  //                   link_temp['source'] = merged_nodes[getNodeIndex(link_temp['source'], merged_nodes)];
  //                   merged_links.push(link_temp);
  //               }
  //               //nodes = merged_nodes;
  //               //links = merged_links;
  //               restart();
  //
  //           },
  //           error: function(xhr) {
  //           }
  //       });
  //   },
  //   error: function(xhr) {
  //   }
  // });
  //
  //

}, 5000);

function convertNodesAndLinksToString() {
  var removedNodesArr = [], addedNodesArr = [], addedLinksArr = [], removedLinksArr = [];
  for(var node in removedNodes) {
    removedNodesArr.push(JSON.stringify(removedNodes[node]));
  }
  for(var node in addedNodes) {
    addedNodesArr.push(JSON.stringify(addedNodes[node]));
  }
  for(var node in addedLinks) {
    addedLinksArr.push(JSON.stringify(addedLinks[node]));
  }
  for(var node in removedLinks) {
    removedLinksArr.push(JSON.stringify(removedLinks[node]));
  }
  return [
    JSON.stringify(addedNodesArr),
    JSON.stringify(removedNodesArr),
    JSON.stringify(addedLinksArr),
    JSON.stringify(removedLinksArr)
  ];
}
// set up SVG for D3
var width  = 960,
    height = 500,
    colors = d3.scale.category10();

var svg = d3.select('body')
    .append('svg')
    .attr('oncontextmenu', 'return false;')
    .attr('width', width)
    .attr('height', height);

// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.

var removedNodes = [],
    addedNodes = [],
    removedLinks = [],
    addedLinks = [];


// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(150)
    .charge(-500)
    .on('tick', tick)

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');

// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
}

function getNodeIndex(node, nodes){
    for(var n in nodes){
        if(nodes[n]['id'] == node['id'])
            return parseInt(n);
    }
    return -1;
}

function getLinkIndex(link, links){
    for(var l in links){
        if(link==null) {
            console.log('null link');
            continue;
        }
        if(
            getNodeIndex(links[l].source) == getNodeIndex(link.source) &&
            getNodeIndex(links[l].target) == getNodeIndex(link.source) &&
            getNodeIndex(links[l].left) == getNodeIndex(link.left) &&
            getNodeIndex(links[l].right) == getNodeIndex(link.right)
        ){
            return parseInt(l);
        }
    }
    return -1;
}


// update force layout (called automatically each iteration)
function tick() {
    // draw directed edges with proper padding from node centers
    path.attr('d', function(d) {
        var deltaX = d.target.x - d.source.x,
            deltaY = d.target.y - d.source.y,
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            normX = deltaX / dist,
            normY = deltaY / dist,
            sourcePadding = d.left ? 17 : 12,
            targetPadding = d.right ? 17 : 12,
            sourceX = d.source.x + (sourcePadding * normX),
            sourceY = d.source.y + (sourcePadding * normY),
            targetX = d.target.x - (targetPadding * normX),
            targetY = d.target.y - (targetPadding * normY);
        return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    });

    circle.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
    });
}

// update graph (called when needed)
function restart() {
    // path (link) group
    path = path.data(links);

    // update existing links
    path.classed('selected', function(d) { return d === selected_link; })
        .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
        .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


    // add new links
    path.enter().append('svg:path')
        .attr('class', 'link')
        .classed('selected', function(d) { return d === selected_link; })
        .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
        .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
        .on('mousedown', function(d) {
            if(d3.event.ctrlKey) return;

            // select link
            mousedown_link = d;
            if(mousedown_link === selected_link) selected_link = null;
            else selected_link = mousedown_link;
            selected_node = null;
            restart();
        });

    // remove old links
    path.exit().remove();


    // circle (node) group
    // NB: the function arg is crucial here! nodes are known by id, not by index!
    circle = circle.data(nodes, function(d) { return d.id; });

    // update existing nodes (reflexive & selected visual states)
    circle.selectAll('circle')
        .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
        .classed('reflexive', function(d) { return d.reflexive; });

    // add new nodes
    var g = circle.enter().append('svg:g');

    g.append('svg:circle')
        .attr('class', 'node')
        .attr('r', 12)
        .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
        .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
        .classed('reflexive', function(d) { return d.reflexive; })
        .on('mouseover', function(d) {
            if(!mousedown_node || d === mousedown_node) return;
            // enlarge target node
            d3.select(this).attr('transform', 'scale(1.1)');
        })
        .on('mouseout', function(d) {
            if(!mousedown_node || d === mousedown_node) return;
            // unenlarge target node
            d3.select(this).attr('transform', '');
        })
        .on('mousedown', function(d) {
            if(d3.event.ctrlKey) return;

            // select node
            mousedown_node = d;
            if(mousedown_node === selected_node) selected_node = null;
            else selected_node = mousedown_node;
            selected_link = null;

            // reposition drag line
            drag_line
                .style('marker-end', 'url(#end-arrow)')
                .classed('hidden', false)
                .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

            restart();
        })
        .on('mouseup', function(d) {
            if(!mousedown_node) return;

            // needed by FF
            drag_line
                .classed('hidden', true)
                .style('marker-end', '');

            // check for drag-to-self
            mouseup_node = d;
            if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

            // unenlarge target node
            d3.select(this).attr('transform', '');

            // add link to graph (update if exists)
            // NB: links are strictly source < target; arrows separately specified by booleans
            var source, target, direction;
            if(mousedown_node.id < mouseup_node.id) {
                source = mousedown_node;
                target = mouseup_node;
                direction = 'right';
            } else {
                source = mouseup_node;
                target = mousedown_node;
                direction = 'left';
            }

            var link;
            link = links.filter(function(l) {
                return (l.source === source && l.target === target);
            })[0];

            if(link) {
                link[direction] = true;
            } else {
                link = {source: source, target: target, left: true, right: true};
                link[direction] = true;
                links.push(link);
                addedLinks.push(pruneLink(link));
            }

            // select new link
            selected_link = link;
            selected_node = null;
            restart();
        });

    // show node IDs
    g.append('svg:text')
        .attr('x', 0)
        .attr('y', 4)
        .attr('class', 'id')
        .text(function(d) { return d.id; });

    // remove old nodes
    circle.exit().remove();

    // set the graph in motion
    force.start();
}


function pruneNode(node){
    return {
        id: node['id'],
        reflexive: node['reflexive']
    };
}

function pruneLink(link){
    return {
        source: pruneNode(link['source']),
        target: pruneNode(link['target']),
        left: link['left'],
        right: link['right']
    };
}

function mousedown() {
    // prevent I-bar on drag
    //d3.event.preventDefault();

    // because :active only works in WebKit?
    svg.classed('active', true);

    if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

    // insert new node at point
    var point = d3.mouse(this),
        node = {id: client_id+String(++lastNodeId), reflexive: false};

    node.x = point[0];
    node.y = point[1];
    nodes.push(pruneNode(node));
    addedNodes.push(pruneNode(node));

    restart();
}

function mousemove() {
    if(!mousedown_node) return;

    // update drag line
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

    restart();
}

function mouseup() {
    if(mousedown_node) {
        // hide drag line
        drag_line
            .classed('hidden', true)
            .style('marker-end', '');
    }

    // because :active only works in WebKit?
    svg.classed('active', false);

    // clear mouse event vars
    resetMouseVars();
}

function spliceLinksForNode(node) {
    var toSplice = links.filter(function(l) {
        return (l.source === node || l.target === node);
    });
    toSplice.map(function(l) {
        links.splice(links.indexOf(l), 1);
        removedLinks.push(pruneLink(l));
    });
}

// only respond once per keydown
var lastKeyDown = -1;

function keydown() {
    d3.event.preventDefault();

    if(lastKeyDown !== -1) return;
    lastKeyDown = d3.event.keyCode;

    // ctrl
    if(d3.event.keyCode === 17) {
        circle.call(force.drag);
        svg.classed('ctrl', true);
    }

    if(!selected_node && !selected_link) return;
    switch(d3.event.keyCode) {
        case 8: // backspace
        case 46: // delete
            if(selected_node) {
                nodes.splice(nodes.indexOf(selected_node), 1);
                removedNodes.push(pruneNode(selected_node));
                spliceLinksForNode(selected_node);
            } else if(selected_link) {
                links.splice(links.indexOf(selected_link), 1);
                removedLinks.push(pruneLink(selected_link));
            }
            selected_link = null;
            selected_node = null;
            restart();
            break;
    }
}

function keyup() {
    lastKeyDown = -1;

    // ctrl
    if(d3.event.keyCode === 17) {
        circle
            .on('mousedown.drag', null)
            .on('touchstart.drag', null);
        svg.classed('ctrl', false);
    }
}

// app starts here
svg.on('mousedown', mousedown)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup);
d3.select(window)
    .on('keydown', keydown)
    .on('keyup', keyup);
restart();
