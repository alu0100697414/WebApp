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

    $scope.date = Math.floor(Date.now()/1000);

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

        $scope.date = Math.floor(Date.now()/1000);
    };

    $scope.delete = function (id) {
        console.log($scope.delete);
        $http({
            method: 'DELETE',
            url: '/deletestatusdevice/' + id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.estados = response;
            console.log(response);
            updateData();

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

    $scope.getMinutes = function (value) {
        return Math.ceil(value/60);
    }

    $scope.getHours = function (value) {
        return Math.ceil(value/3600);
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

streamingApp.controller('EstadoAgresoresCtrl', function ($scope, $http, $location) {

    $scope.date = Math.floor(Date.now()/1000);

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

        $scope.date = Math.floor(Date.now()/1000);
        console.log($scope.date);
    };

    $scope.delete = function (id) {
        console.log($scope.delete);
        $http({
            method: 'DELETE',
            url: '/deletestatusdevice/' + id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.codeStatus = response;
            $scope.estados = response;
            console.log(response);
            updateData();

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

    $scope.getMinutes = function (value) {
        return Math.ceil(value/60);
    }

    $scope.getHours = function (value) {
        return Math.ceil(value/3600);
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

streamingApp.controller('MapaCtrl', function ($scope, $http, $window, $location, $sce, $location, $anchorScroll, $window) {

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

    // Actualiza el menú de items por si se añade alguno nuevo
    var updateMenu = function () {
        $http({
            method: 'GET',
            url: '/allstatusdevice',
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
            }
        }).error(function (response) {  // Getting Error Response in Callback
            console.log("error");
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
    };

    // Inicializamos el mapa para luego poder trabajar con el sin
    // que sea necesario inicializarlo de nuevo
    var mapOptions = {
      zoom: 15,
      center: new google.maps.LatLng(40.433689, -3.703578)
    }

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var marker_v, marker_a;

    // Actualizamos los markers del mapa para la victima seleccionada
    var updateMarkers = function () {
        // Si la url tiene el id de un dispositivo, actualizamos markers
        if($location.url() !== ""){
          $http({
              method: 'GET',
              url: '/updatemarkers/' + $location.url().substr(1),
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(function (response) {
              $scope.codeStatus = response;

              var mapOptions = {
                zoom: map.getZoom(),
                center: new google.maps.LatLng(response.latitude, response.longitude)
              }
              map.setOptions(mapOptions);

              if(marker_v != null  && marker_a != null){
                  marker_v.setMap(null);
                  marker_a.setMap(null);
              }

              marker_v = new google.maps.Marker({
                  position: new google.maps.LatLng(response.latitude, response.longitude),
                  animation: google.maps.Animation.Bounce,
                  map: map
              });
              marker_v.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');

              marker_a = new google.maps.Marker({
                  position: new google.maps.LatLng(response.latitude_aggressor, response.longitude_aggressor),
                  animation: google.maps.Animation.Bounce,
                  map: map
              });
              marker_a.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
          }).error(function (response) {  // Getting Error Response in Callback
              console.log("error");
              $scope.codeStatus = response || "Request failed";
              console.log($scope.codeStatus);
          });
        }
    };

    // Añade id a la url para poder buscar los markers y el mapa para esa victima y agresor en particular
    $scope.showMap = function (id) {
      $location.hash(id);

      var els = [].slice.apply(document.getElementsByClassName("collection-item active"));
      for (var i = 0; i < els.length; i++) {
          els[i].className = els[i].className.replace("collection-item active", "collection-item");
      }

      document.getElementById(id).className = 'collection-item active';
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
        $scope.$apply(updateMenu);
        $scope.$apply(updateMarkers);
    }, 1000);

});

streamingApp.controller('ContactCtrl', function ($scope, $http, $location) {

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