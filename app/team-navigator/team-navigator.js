angular.module("teamNavigatorDemo").directive("teamNavigator", function() {
    return {
        restrict: "E",
        scope: {
            teamData: "="
        },
        link: function(scope, element, attrs) {

            // Constants
            var NODE_TRANSITION_DURATION = 500;
            var LINK_TRANSITION_DURATION = 700;

            // Team Data
            var teamsById = {};
            var teamsByParentId = {};

            // D3 Elements
            var canvas = d3.select(element[0]).append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .append("g")
                .attr("transform", function(d) {
                    return "translate(0, 100)";
                });

            var tree = d3.layout.tree()
                .separation(function(a, b) { return 70; })
                .size([500, 500]);

            var diagonal = d3.svg.diagonal()
                .projection(function(d) { return [d.x, d.y]; });

            // Initialization
            loadTeamData();
            updateTree(1);

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
                        "id": parentTeam.id,
                        "parentId": parentTeam.parentId,
                        "children": [{
                            "name": selectedTeam.name,
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

                var node = canvas.selectAll("g.node")
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
                    .attr("fill", "lightsteelblue");

                nodeEnter.append("text")
                    // .attr("dx", 0)
                    // .attr("dy", 0)
                    .attr("text-anchor", "middle")
                    .text(function(d) { return d.name; })
                    .style("fill-opacity", 1e-6);

                // Transition entering nodes
                var nodeUpdate = node.transition()
                    .duration(NODE_TRANSITION_DURATION)
                    .attr("transform", function(node) {
                        return "translate(" + node.x + "," + node.y + ")";
                    });

                nodeUpdate.select("circle")
                    .attr("r", 60);

                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                // Transition exiting nodes
                var nodeExit = node.exit().transition()
                    .duration(NODE_TRANSITION_DURATION)
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update links
                var link = canvas.selectAll("path.link")
                    .data(links, function(link) {
                        return link.target.id;
                    });

                // Transition new links
                link.enter()
                    .insert("path", "g")
                    .attr("class", "link")
                    .attr("d", diagonal)
                    .attr("stroke-opacity", 1e-6);

                link.transition()
                    .duration(LINK_TRANSITION_DURATION)
                    .attr("d", diagonal)
                    .attr("stroke-opacity", 1);

                link.exit()
                    .transition()
                    .duration(LINK_TRANSITION_DURATION)
                    .attr("d", diagonal)
                    .attr("stroke-opacity", 1e-6)
                    .remove();
            }

            function nodeClicked(node) {
                updateTree(node.id);
            }
        }
    }
});