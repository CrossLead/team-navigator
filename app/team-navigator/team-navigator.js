angular.module("teamNavigatorDemo").directive("teamNavigator", function() {
    return {
        restrict: "E",
        scope: {
            teamData: "="
        },
        link: function(scope, element, attrs) {

            function 

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
});