angular.module("teamNavigatorDemo").directive("teamNavigator", function() {
    return {
        restrict: "E",
        scope: {
            teamData: "="
        },
        link: function(scope, element, attrs) {

            // Team Data
            var rootNode = null;
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
            updateTree(2);

            // Load team hierarchy data (received in raw format as scope.teamData)
            // into dictionaries (teamsById and teamsByParentId) from which to
            // build D3 trees for each selected team
            function loadTeamData() {
                scope.teamData.forEach(function(team) {
                    teamsById[team.id] = team;

                    if (!team.parentId) {
                        // Expect only one root node with no parentId
                        rootNode = team;
                    } else {
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
                        "children": childTeams
                    }
                }
                // Case: All other nodes (with parent node)
                else {
                    var parentTeam = teamsById[selectedTeam.parentId];
                    treeData = {
                        "name": parentTeam.name,
                        "children": [{
                            "name": selectedTeam.name,
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
                    .data(nodes)
                    .enter()
                    .append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                node.append("circle")
                    .attr("r", 50)
                    .attr("fill", "steelblue");

                node.append("text")
                    // .attr("dx", 0)
                    // .attr("dy", 0)
                    .attr("text-anchor", "middle")
                    .text(function(d) { return d.name; });

                var link = canvas.selectAll("path.link")
                    .data(links)
                    .enter()
                    .insert("path", "g")
                    .attr("class", "link")
                    .attr("d", diagonal);
            }
        }
    }
});