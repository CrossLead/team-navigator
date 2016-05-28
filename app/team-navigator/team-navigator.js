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
                .attr("width", 500)
                .attr("height", 500);

            var tree = d3.layout.tree()
                .size([500, 500]);

            var nodes = tree.nodes(treeData);
            var links = tree.links(nodes);

            debugger;

            canvas.selectAll(".link")
                .data(links)
                .enter()
                .append('line')
                .attr('class', 'link')
                .attr('x1', function(d){return d.source.x})
                .attr('y1', function(d){return d.source.y})
                .attr('x2', function(d){return d.target.x})
                .attr('y2', function(d){return d.target.y})
                .attr('stroke', 'black');

            canvas.selectAll(".node")
                .data(nodes)
                .enter()
                .append('text')
                .attr('class', 'node')
                .attr('x', function(d){return d.x})
                .attr('y', function(d){return d.y})
                .text(function(d){ return d.name;});
        }
    }
});