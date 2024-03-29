angular.module("teamNavigatorDemo").directive("teamNavigator", function() {
    return {
        restrict: "E",
        scope: {
            teamData: "=",
            selectedTeamId: "=",
            onTeamSelected: "="
        },
        link: function(scope, element, attrs) {

            // Constants
            var NODE_TRANSITION_DURATION = 500;
            var LINK_TRANSITION_DURATION = 700;
            var CANVAS_WIDTH = 1000;
            var CANVAS_HEIGHT = 600;
            var NODE_RADIUS = 40;
            var SELECTED_NODE_RADIUS = 60;
            var NODE_PADDING = 20;

            // Team Data
            var teamsById = {};
            var teamsByParentId = {};

            // D3 Elements
            var canvas = d3.select(element[0]).append("svg")
                .attr("width", CANVAS_WIDTH)
                .attr("height", CANVAS_HEIGHT)
                .attr("id", "canvas");
                
            canvas.append("g")
                .attr("id", "links")
                .attr("transform", function(d) {
                    return "translate(0," + (SELECTED_NODE_RADIUS + NODE_PADDING) + ")";
                });
                
            canvas.append("g")
                .attr("id", "nodes")
                .attr("transform", function(d) {
                    return "translate(0," + (SELECTED_NODE_RADIUS + NODE_PADDING) + ")";
                });
                
            canvas.append("clipPath")
                .attr("id", "node-clip")
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", NODE_RADIUS);
                
            canvas.append("clipPath")
                .attr("id", "selected-node-clip")
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", SELECTED_NODE_RADIUS);

            canvas.append("svg:defs").selectAll("marker")
                .data(["end", "long-end"])
                .enter()
                .append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 0 20 20")
                .attr("refX", 12)
                .attr("refY", 3)
                .attr("markerWidth", 20)
                .attr("markerHeight", 20)
                .attr("orient", "auto")
                .append("svg:path")
                .attr("d", "M0,0L12,3L0,6");

            var tree = d3.layout.tree()
                .separation(function(a, b) { return NODE_RADIUS + NODE_PADDING; })
                .size([CANVAS_WIDTH - (NODE_RADIUS * 4), CANVAS_HEIGHT - (NODE_RADIUS * 4)]);

            // Initialization
            loadTeamData();
            updateTree(parseInt(scope.selectedTeamId));

            // Load team hierarchy data (received in raw format as scope.teamData)
            // into dictionaries (teamsById and teamsByParentId) from which to
            // build D3 trees for each selected team
            function loadTeamData() {
                scope.teamData.forEach(function(team) {
                    teamsById[team.id] = team;

                    if (team.parentId) {
                        if (!teamsByParentId[team.parentId]) {
                            teamsByParentId[team.parentId] = [ team ];
                        } else {
                            teamsByParentId[team.parentId].push(team);
                        }
                    }
                });
            }

            // Generate and render the D3 tree layout for the selected team.
            // This will include the team's parent and children
            function updateTree(selectedTeamId) {
                var selectedTeam = teamsById[selectedTeamId];
                var childTeams = teamsByParentId[selectedTeamId];
                var treeData;

                // Case: Root Node
                if (!selectedTeam.parentId) {
                    treeData = {
                        "name": selectedTeam.name,
                        "icon": selectedTeam.icon,
                        "id": selectedTeam.id,
                        "parentId": null,
                        "children": childTeams
                    }
                }
                // Case: All other nodes (with parent node)
                else {
                    var parentTeam = teamsById[selectedTeam.parentId];
                    treeData = {
                        "name": parentTeam.name,
                        "icon": parentTeam.icon,
                        "id": parentTeam.id,
                        "parentId": parentTeam.parentId,
                        "children": [{
                            "name": selectedTeam.name,
                            "icon": selectedTeam.icon,
                            "id": selectedTeam.id,
                            "parentId": selectedTeam.parentId,
                            "children": childTeams
                        }]
                    };
                }

                rerenderTree(treeData);
            }

            function rerenderTree(treeData) {
                var nodes = tree.nodes(treeData);
                var links = tree.links(nodes);
                
                // Update links
                var link = canvas.select("#links")
                    .selectAll(".link")
                    .data(links, function(link) {
                        return link.target.id;
                    });

                // Transition new links
                link.enter()
                    .append("line")
                    .attr("class", "link")
                    .attr("opacity", 0);

                link.transition()
                    .duration(LINK_TRANSITION_DURATION)
                    .attr("opacity", 1)
                    .attr("transform", function(link) {
                        
                        var translateY = link.target.depth == 1
                            ? NODE_RADIUS
                            : NODE_RADIUS * 3;
                            
                        if (link.source.id == scope.selectedTeamId) {
                            translateY = link.target.depth == 1
                                ? SELECTED_NODE_RADIUS
                                : SELECTED_NODE_RADIUS * 2 + NODE_RADIUS
                        }

                        var scaleY = (link.target.y - link.source.y - (NODE_RADIUS + SELECTED_NODE_RADIUS)) /
                            (link.target.y - link.source.y);

                        // Scale to account for node radius
                        return "translate(0," + translateY + ")"
                            + " scale(1," + scaleY + ")";
                    })
                    .attr("x1", function(link) { return link.source.x; })
                    .attr("y1", function(link) { return link.source.y; })
                    .attr("x2", function(link) { return link.target.x; })
                    .attr("y2", function(link) { return link.target.y; })
                    .attr("marker-end", "url(#end)");

                link.exit()
                    .transition()
                    .duration(LINK_TRANSITION_DURATION)
                    .attr("opacity", 0)
                    .attr("marker-end", null)
                    .remove();

                var node = canvas.select("#nodes")
                    .selectAll("g.node")
                    .data(nodes, function(data) {
                        return data.id;
                    });

                var nodeEnter = node
                    .enter()
                    .append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
                    .on("click", nodeClicked);

                nodeEnter.append("circle")
                    .attr("r", 1e-6)
                    .attr("fill", "plum")
                    .attr("stroke", "slategrey")
                    .attr("stroke-width", "2px");

                nodeEnter.append("image")
                    .attr("xlink:href", function(node) { return node.icon; })
                    .attr("opacity", 1e-6);
                    
                nodeEnter.append("text")
                    .attr("class", "node-label")
                    .attr("text-anchor", "middle")
                    .attr("font-size", "12px")
                    .attr("fill", "black")
                    .text(function(node) { return node.name; })
                    .style("fill-opacity", 1e-6);
                    
                nodeEnter.append("text")
                    .attr("class", "child-count")
                    .attr("text-anchor", "middle")
                    .attr("font-size", "12px")
                    .attr("fill", "black")
                    .text(function(node) {
                        var count = teamsByParentId[node.id] 
                            ? teamsByParentId[node.id].length
                            : 0;
                        return "(" + count + ")"; 
                    })
                    .style("fill-opacity", 1e-6);
                    
                nodeEnter.append("text")
                    .attr("class", "select-label")
                    .attr("text-anchor", "end")
                    .attr("font-size", "12px")
                    .attr("fill", "royalblue")
                    .text("Select")
                    .style("fill-opacity", 1e-6)
                    .on("click", function() {
                        scope.onTeamSelected(scope.selectedTeamId);
                    });

                // Transition entering nodes
                var nodeUpdate = node.transition()
                    .duration(NODE_TRANSITION_DURATION)
                    .attr("transform", function(node) {
                        return "translate(" + node.x + "," + node.y + ")";
                    });

                nodeUpdate.select("circle")
                    .attr("r", function(node) {
                        if (node.id == scope.selectedTeamId) {
                            return SELECTED_NODE_RADIUS;
                        }
                        return NODE_RADIUS;
                    });

                nodeUpdate.select(".node-label")
                    .style("fill-opacity", 1)
                    .attr("dx", 0)
                    .attr("dy", function(node) {
                        if (node.id == scope.selectedTeamId) {
                            return SELECTED_NODE_RADIUS + NODE_PADDING;
                        }
                        return NODE_RADIUS + NODE_PADDING;
                    });
                    
                nodeUpdate.select(".child-count")
                    .style("fill-opacity", 1)
                    .attr("dx", 0)
                    .attr("dy", function(node) {
                        if (node.id == scope.selectedTeamId) {
                            return SELECTED_NODE_RADIUS + (NODE_PADDING * 2);
                        }
                        return (NODE_RADIUS + NODE_PADDING * 2);
                    });
                    
                nodeUpdate.select(".select-label")
                    .style("fill-opacity", 1)
                    .attr("dx", SELECTED_NODE_RADIUS * 2)
                    .text(function(node) {
                        if (node.id == scope.selectedTeamId) {
                            return "Select";
                        }
                        return "";
                    });

                nodeUpdate.select("image")
                    .attr("opacity", 1)
                    .attr("clip-path", function(node) {
                        if (node.id == scope.selectedTeamId) {
                            return "url(#selected-node-clip)";
                        }
                        return "url(#node-clip)";
                    })
                    .attr("x", function(node) {
                        if (node.id == scope.selectedTeamId) {
                            return "-" + SELECTED_NODE_RADIUS  + "px";
                        }
                        return "-" + NODE_RADIUS  + "px";
                    })
                    .attr("y", function(node) {
                        if (node.id == scope.selectedTeamId) {
                            return "-" + SELECTED_NODE_RADIUS  + "px";
                        }
                        return "-" + NODE_RADIUS  + "px";
                    })
                    .attr("width", function(node) {
                        if (node.id == scope.selectedTeamId) {
                            return (SELECTED_NODE_RADIUS * 2) + "px";
                        }
                        return (NODE_RADIUS * 2) + "px";
                    })
                    .attr("height", function(node) {
                        if (node.id == scope.selectedTeamId) {
                            return (SELECTED_NODE_RADIUS * 2) + "px";
                        }
                        return (NODE_RADIUS * 2) + "px";
                    });

                // Transition exiting nodes
                var nodeExit = node.exit().transition()
                    .duration(NODE_TRANSITION_DURATION)
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                nodeExit.select("image")
                    .attr("opacity", 1e-6);
            }

            function nodeClicked(node) {
                scope.selectedTeamId = node.id;
                updateTree(node.id);
            }
        }
    }
});