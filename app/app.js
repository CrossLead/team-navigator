"use strict";

var app = angular.module("teamNavigatorDemo", []);

app.controller("teamNavigatorDemoController", function($scope) {
    
    $scope.teamSelected = function(teamId) {
        console.log(teamId + " selected!");
    }

    // Test Data
    $scope.teamData = [
        {
            "name": "Organization",
            "icon": "img/organization.png",
            "id": 1,
            "parentId": null
        },
        {
            "name": "Business Development",
            "icon": "img/business.png",
            "id": 2,
            "parentId": 1
        },
        {
            "name": "Business Development Team A",
            "icon": "img/business.png",
            "id": 3,
            "parentId": 2
        },
        {
            "name": "Business Development Team B",
            "icon": "img/business.png",
            "id": 4,
            "parentId": 2
        },
        {
            "name": "Business Development Team C",
            "icon": "img/business.png",
            "id": 5,
            "parentId": 2
        },
        {
            "name": "Design",
            "icon": "img/design.png",
            "id": 6,
            "parentId": 1
        },
        {
            "name": "Design Team A",
            "icon": "img/design.png",
            "id": 7,
            "parentId": 6
        },
        {
            "name": "Design Team B",
            "icon": "img/design.png",
            "id": 8,
            "parentId": 6
        },
        {
            "name": "Design Team C",
            "icon": "img/design.png",
            "id": 9,
            "parentId": 6
        },
        {
            "name": "Engineering",
            "icon": "img/engineering.png",
            "id": 10,
            "parentId": 1
        },
        {
            "name": "Platform",
            "icon": "img/platform.png",
            "id": 11,
            "parentId": 10
        },
        {
            "name": "Individual Task Management",
            "icon": "img/taskmanagement.png",
            "id": 12,
            "parentId": 10
        },
        {
            "name": "Sales",
            "icon": "img/sales.png",
            "id": 14,
            "parentId": 1
        },
        {
            "name": "Sales Team A",
            "icon": "img/sales.png",
            "id": 15,
            "parentId": 14
        },
        {
            "name": "Sales Team B",
            "icon": "img/sales.png",
            "id": 16,
            "parentId": 14
        },
        {
            "name": "Sales Team C",
            "icon": "img/sales.png",
            "id": 17,
            "parentId": 14
        }
    ];
});