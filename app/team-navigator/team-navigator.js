angular.module("teamNavigatorDemo").directive("teamNavigator", function() {
    return {
        restrict: "E",
        templateUrl: "team-navigator/team-navigator.html",
        link: function(scope, element, attrs) {

            // Test Data
            var treeData =
            {
                "name": "Top Level",
                "parent": "null",
                "children": [
                    {
                        "name": "Level 2 A",
                        "parent": "Top Level",
                        "children": [
                            {
                                "name": "Level 3 A",
                                "parent": "Level 2 A",
                            },
                            {
                                "name": "Level 3 B",
                                "parent": "Level 2 A",
                            }
                        ]
                    },
                    {
                        "name": "Level 2 B",
                        "parent": "Top Level",
                        "children": [
                            {
                                "name": "Level 3 C",
                                "parent": "Level 2 B"
                            },
                            {
                                "name": "Level 3 D",
                                "parent": "Level 2 B"
                            }
                        ]
                    }
                ]
            };

            var canvas = d3.select(element[0]).append("svg")
                .attr("width", '100%')
                .attr("height", '100%')
                .append("g");

            var tree = d3.layout.tree()
                .size([500, 500]);

            var diagonal = d3.svg.diagonal()
                .projection(function(d) { return [d.y, d.x]; });

            var nodes = tree.nodes(treeData);
            var links = tree.links(nodes);

            var node = canvas.selectAll("g.node")
                .data(nodes)
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            node.append("circle")
                .attr("r", 4.5);

            node.append("text")
                .attr("dx", 8)
                .attr("dy", 3)
                .attr("text-anchor", "start")
                .text(function(d) { return d.name; });

            var link = canvas.selectAll("path.link")
                .data(links)
                .enter()
                .insert("path", "g")
                .attr("class", "link")
                .attr("d", diagonal);
        }
    }
});