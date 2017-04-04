var streamingApp = angular.module('streamingApp', ['ngResource', 'ngSanitize']);

streamingApp.config(['$sceProvider', function ($sceProvider) {
    $sceProvider.enabled(false);
}]);

streamingApp.controller('CamarasCtrl', function ($scope, $http, $window, $location, $sce, $location, $anchorScroll, $window) {


    $scope.camaras = [];
    var isElement = function (element, list) {
        var keepGoing = true;
        angular.forEach(list, function (element_list) {
            if (keepGoing) {
                if (angular.equals(element_list._id, element._id)) {
                    keepGoing = false;
                }
            }
        });
        return keepGoing;
    };
    var updateData = function () {
        $http({
            method: 'GET',
            url: '/livecameras',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            if ($scope.camaras.length !== response.length) {
                if (response.length > $scope.camaras.length) { // Si añadimos
                    $scope.camaras = response;
                    angular.forEach(response, function (camara, index) {
                        if (isElement(camara, $scope.camaras)) {
                            $scope.camaras.push(camara);
                            $window.location.reload();                    //$scope.camaras = response;

                        }
                    })
                } else {
                    angular.forEach($scope.camaras, function (camara, index) {
                        if (response.indexOf(camara) < 0) {
                            $scope.camaras.pop(camara);
                        }
                    })
                }
                $scope.livecounter = $scope.camaras.length;

            }
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };

    /* To refresh data */
    var timer = setInterval(function () {
        $scope.$apply(updateData);
    }, 1000);

    updateData();

    //$scope.init = function (id) {
    //
    //};

    $scope.isActive = function (route) {

        var path = $location.absUrl().split("/");
        console.log(route === path[path.length - 1]);
        //console.log($location.absUrl());
        //console.log(route === $location.path().toString);
        return route === path[path.length - 1];
    }

    $scope.scrollTo = function (id) {
        $location.hash('camara-' + id);
        $anchorScroll();
    };

    $scope.delete = function (id) {
        console.log($scope.delete);
        $http({
            method: 'DELETE',
            url: '/camara/' + id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.camaras = response;
            console.log(response);
            updateData();

        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };


    $scope.livecounter = 0;
    $http({
        method: 'GET',
        url: '/livecameras',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (response) {
        $scope.codeStatus = response;
        $scope.livecounter = response.length;
        console.log(response);
    }).error(function (response) {  // Getting Error Response in Callback
        console.log("error");
        $scope.codeStatus = response || "Request failed";
        $scope.livecounter = 0;
        console.log($scope.livecounter);
    });


});

streamingApp.controller('ListCamarasCtrl', function ($scope, $http, $location) {

    var updateData = function () {
        $http({
            method: 'GET',
            url: '/camaras',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.camaras = response;
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };


    updateData();

    $scope.camaras = [];

    $scope.isActive = function (route) {

        var path = $location.absUrl().split("/");
        console.log(route === path[path.length - 1]);
        //console.log($location.absUrl());
        //console.log(route === $location.path().toString);
        return route === path[path.length - 1];
    }


    $scope.delete = function (id) {
        console.log($scope.delete);
        $http({
            method: 'DELETE',
            url: '/camara/' + id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.camaras = response;
            console.log(response);
            updateData();

        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };


    $scope.livecounter = 0;
    var updateLivecounter = function(){
        $http({
            method: 'GET',
            url: '/livecameras',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.livecounter = response.length;
            console.log(response);
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            $scope.livecounter = 0;
            console.log($scope.livecounter);
        });
    }

    /* To refresh data */
    var timer = setInterval(function () {
        $scope.$apply(updateData);
        $scope.$apply(updateLivecounter);
    }, 1000);

});

streamingApp.controller('HistorialCtrl', function ($scope, $http, $location) {

    var updateData = function () {
        $http({
            method: 'GET',
            url: '/gethistorial',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.historiales = response;
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };

    updateData();

    $scope.historiales = [];

    $scope.isActive = function (route) {
        var path = $location.absUrl().split("/");
        console.log(route === path[path.length - 1]);
        //console.log($location.absUrl());
        //console.log(route === $location.path().toString);
        return route === path[path.length - 1];
    }

    $scope.delete = function () {
        console.log($scope.delete);
        $http({
            method: 'DELETE',
            url: '/deletehistorial',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.historiales = response;
            console.log(response);
            updateData();

        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };


    $scope.livecounter = 0;
    var updateLivecounter = function(){
        $http({
            method: 'GET',
            url: '/livecameras',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.livecounter = response.length;
            console.log(response);
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            $scope.livecounter = 0;
            console.log($scope.livecounter);
        });
    }

    /* To refresh data */
    var timer = setInterval(function () {
        $scope.$apply(updateData);
        $scope.$apply(updateLivecounter);
    }, 1000);

});

streamingApp.controller('EstadoCtrl', function ($scope, $http, $location) {

    var updateData = function () {
        $http({
            method: 'GET',
            url: '/getEstado',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.estados = response;
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };

    updateData();

    $scope.estados = [];

    $scope.isActive = function (route) {
        var path = $location.absUrl().split("/");
        console.log(route === path[path.length - 1]);
        //console.log($location.absUrl());
        //console.log(route === $location.path().toString);
        return route === path[path.length - 1];
    }

    $scope.livecounter = 0;
    var updateLivecounter = function(){
        $http({
            method: 'GET',
            url: '/livecameras',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.livecounter = response.length;
            console.log(response);
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            $scope.livecounter = 0;
            console.log($scope.livecounter);
        });
    }

    /* To refresh data */
    var timer = setInterval(function () {
        $scope.$apply(updateData);
        $scope.$apply(updateLivecounter);
    }, 1000);

});

streamingApp.controller('IncidenciasCtrl', function ($scope, $http, $location) {

    var updateIncidences = function () {
        $http({
            method: 'POST',
            url: '/updateincidences',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };

    $scope.delete = function (id) {
        console.log($scope.delete);
        $http({
            method: 'DELETE',
            url: '/incidencia/' + id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.camaras = response;
            console.log(response);
            updateData();

        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };

    var updateData = function () {
        $http({
            method: 'GET',
            url: '/getIncidencias',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.incidencias = response;
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };

    updateData();

    $scope.incidencias = [];

    $scope.isActive = function (route) {
        var path = $location.absUrl().split("/");
        console.log(route === path[path.length - 1]);
        //console.log($location.absUrl());
        //console.log(route === $location.path().toString);
        return route === path[path.length - 1];
    }

    $scope.livecounter = 0;
    var updateLivecounter = function(){
        $http({
            method: 'GET',
            url: '/livecameras',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.livecounter = response.length;
            console.log(response);
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            $scope.livecounter = 0;
            console.log($scope.livecounter);
        });
    }

    /* To refresh data */
    var timer = setInterval(function () {
        $scope.$apply(updateData);
        $scope.$apply(updateIncidences);
        $scope.$apply(updateLivecounter);
    }, 1000);

});

streamingApp.controller('addCamara', function ($scope, $http, $window, $location) {
    $scope.livecounter = 0;
    $http({
        method: 'GET',
        url: '/livecameras',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (response) {
        $scope.codeStatus = response;
        $scope.livecounter = response.length;
        console.log(response);
    }).error(function (response) {  // Getting Error Response in Callback
        console.log("error");
        $scope.codeStatus = response || "Request failed";
        $scope.livecounter = 0;
        console.log($scope.livecounter);
    });


    $scope.isActive = function (route) {

        var path = $location.absUrl().split("/");
        console.log(route === path[path.length - 1]);
        //console.log($location.absUrl());
        //console.log(route === $location.path().toString);
        return route === path[path.length - 1];
    }

    $scope.codeStatus = "";
    $scope.success = false;

    var init = function () {
        $scope.camara = {};
        $scope.camara.name = "";
        $scope.camara.server = "";
    };

    init();

    $scope.send = function () {
        $http({ // Accessing the Angular $http Service to send data via REST Communication to Node Server.
            method: 'POST',
            url: '/camara',
            headers: {'Content-Type': 'application/json'},
            data: $scope.camara
        }).success(function (response) {
            $scope.success = true;
            init();
        }).error(function (response) {
            console.log("error"); // Getting Error Response in Callback
        });
    };


});

streamingApp.controller('HomeCtrl', function ($scope, $http, $window, $location) {

    $scope.livecounter = 0;
    var updateLivecounter = function(){
        $http({
            method: 'GET',
            url: '/livecameras',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.livecounter = response.length;
            console.log(response);
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            $scope.livecounter = 0;
            console.log($scope.livecounter);
        });
    }

    $scope.isActive = function (route) {

        var path = $location.absUrl().split("/");
        console.log(route === path[path.length - 1]);
        //console.log($location.absUrl());
        //console.log(route === $location.path().toString);
        return route === path[path.length - 1];
    }

    /* To refresh data */
    var timer = setInterval(function () {
        $scope.$apply(updateLivecounter);
    }, 1000);

});
