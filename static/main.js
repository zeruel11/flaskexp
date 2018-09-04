(function () {
    'use strict';

    angular.module('WordcountApp', [])

        .controller('WordcountController', ['$scope', '$log', '$http', '$timeout',
            function ($scope, $log, $http, $timeout) {
                $scope.submitButtonText = 'Submit';
                $scope.loading = false;
                $scope.urlerror = false;
                $scope.getResults = function () {
                    // $log.log("test");

                    // get url from input
                    var userInput = $scope.url;

                    // call API request
                    $http.post('/start', { "url": userInput }).
                        success(function (results) {
                            $log.log(results);
                            getWordCount(results);
                            $scope.wordcounts = null;
                            $scope.loading = true;
                            $scope.urlerror = false;
                            $scope.submitButtonText = 'Loading...';
                        }).
                        error(function (error) {
                            $log.log(error);
                        });
                };
                function getWordCount(jobID) {
                    var timeout = 30000;

                    var poller = function () {
                        // fire another request
                        $http.get('/results/' + jobID).
                            success(function (data, status, headers, config) {
                                if (status === 202) {
                                    $log.log(data, status);
                                } else if (status === 200) {
                                    $log.log(data);
                                    $scope.loading = false;
                                    $scope.submitButtonText = 'Submit';
                                    $scope.wordcounts = data;
                                    $timeout.cancel(timeout);
                                    return false;
                                }
                                // continue to call the poller() function every 2 seconds
                                // until the timeout is cancelled
                                timeout = $timeout(poller, 2000);
                            }).
                            error(function (error) {
                                $log.log(error);
                                $scope.loading = false;
                                $scope.submitButtonText = 'Submit';
                                $scope.urlerror = true;
                            });
                    };
                    poller();
                }
            },
        ])
        .directive('wordCountChart', ['$parse', '$log', function ($parse, $log) {
            return {
                restrict: 'E',
                replace: true,
                template: '<div id="chart"></div>',
                link: function (scope) {
                    scope.$watch('wordcounts', function () {
                        d3.select('#chart').selectAll('*').remove();
                        var data = scope.wordcounts;
                        for (var word in data) {
                            // $log.log(data[word][0]);
                            d3.select('#chart')
                                .append('div')
                                .selectAll('div')
                                .data(word[0])
                                .enter()
                                .append('div')
                                .style('width', function () {
                                    return (data[word][1] * 10) + 'px';
                                })
                                .text(function (d) {
                                    return data[word][0];
                                });
                        }
                    }, true);
                }
            };
        }]);

}());