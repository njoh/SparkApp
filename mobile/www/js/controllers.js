angular.module('starter.controllers', [])




.controller('AddDeviceCtrl', function($scope, Devices, Chargers, Owned_Devices, Register, $location, $state, $window) {
  Devices.query().$promise.then(function(response){
    $scope.devices = response;
    $scope.device = response[0]; //set selected devie to first one
  });
  
  Register.get().$promise.then(function(response){
    current_user_id = response.id;
    current_user_name = response.first_name;
  });

  $scope.setCharger = function(device) {
    console.log(device);
      Chargers.get({id: device.charger_id}).$promise.then(function(response){
        $scope.charger = response;
      });
  }

  $scope.addDevice = function(device) {
    console.log("Adding a device")

    //TODO get the correct charger to display
    Owned_Devices.save({user_id: current_user_id, 
                        device_id: device.id, 
                        personal_device_name: current_user_name+"'s "+device.name, 
                        allow_lending: true}).$promise.then(function(response){
      console.log('added!')
      $location.path('/tab/borrow');
      //TODO get borrow page to reload on update
      $window.location.reload();  

    });
  }
  // TODO figure out how to see where page is coming from or something
  $scope.close = function() {
    $location.path('/tab/borrow');
  }

})

.controller('BorrowCtrl', function($scope, Devices, Chargers, Owned_Devices, Register) {
  Owned_Devices.query().$promise.then(function(response){
    $scope.owned_devices = response;
    console.log('on borrow tab, these are owned devices', $scope.owned_devices);
  });
  Chargers.query().$promise.then(function(response){
    $scope.chargers = response;
    console.log($scope.chargers);
  });
})

.controller('BorrowDetailCtrl', function($scope, $stateParams, Owned_Devices, Users_By_Charger, $window) {
  //set inital text to read 1 hr 0 min
  $scope.hours = 1;
  $scope.minutes = 0;
  $scope.drag = function(value) {
    $scope.hours = Math.floor(value/60);
    $scope.minutes = value % 60;
  };
  //set initial time to 1 hr
  $scope.rangeValue = 60;

  //set owned_deviceID to scope var to pass along again
  $scope.owned_deviceID = $stateParams.owned_deviceID;
  console.log("OWNED DEVICE ID, this is the id of the device you just clicked on");
  console.log($scope.owned_deviceID);
  $scope.item_details = Owned_Devices.get({id: $scope.owned_deviceID});
  $scope.item_details.$promise.then(function(data) {
       $scope.charger_id = data.charger_id;
   });
})


// .controller('MapCtrl', function($scope, $state, $cordovaGeolocation) {
//    var options = {timeout: 10000, enableHighAccuracy: true};
//  console.log($cordovaGeolocation);
//   $cordovaGeolocation.getCurrentPosition(options).then(function(position){
 
//     var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
//     var mapOptions = {
//       center: latLng,
//       zoom: 15,
//       mapTypeId: google.maps.MapTypeId.ROADMAP
//     };
 
//     $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
 
//   }, function(error){
//     console.log(error);
//     console.log("Could not get location");
//   });
// })

.controller('BorrowLenderMatch', function($scope, $stateParams, Owned_Devices, Users_By_Charger, $window) {
  $scope.owned_deviceID = $stateParams.owned_deviceID;
  $scope.num_min_borrow = $stateParams.borrowTime;
  $scope.charger_id = $stateParams.charger_id;
  console.log("OWNED DEVICE ID, this is the id  of the owned device that needs a charger");
  console.log($scope.owned_deviceID);
  console.log("charger ID, this is the id  of the charger so you can look for other users who have it");
  console.log($scope.charger_id);
  console.log("this is the # min it needs to be borrowed for");
  console.log($scope.num_min_borrow);

  var lat  = 40.4433;//position.coords.latitude;
  var lng = -79.9436;//position.coords.longitude;
  var myLatlng = new google.maps.LatLng(lat, lng);
  var mapOptions = {
      center: myLatlng,
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };          
  
  var map = new google.maps.Map(document.getElementById("map"), mapOptions);          
  $scope.map = map;  

  // Users_By_Charger.query({id: charger_id}).$promise.then(function(response){
  //   $scope.possible_lenders = response;
  //   //sort by distance from current user
  //   $scope.possible_lenders.sort(function(a, b) {
  //       return parseFloat(a.distance) - parseFloat(b.distance);
  //   })
  //   console.log("sorted list of possible lenders",$scope.possible_lenders);
  // });


  function loadMarkers(){
 
      //Get all of the markers from our Markers factory
      Users_By_Charger.query({id: $scope.charger_id}).$promise.then(function(records){
        console.log("Markers: ", records);
        console.log(records.length)
        for (var i = 0; i < records.length; i++) {
          var record = records[i];  
          console.log(record) 
          console.log(record.latitude) 
          console.log(record.longitude) 
          var markerPos = new google.maps.LatLng(record.latitude, record.longitude);
          // Add the markerto the map
          var marker = new google.maps.Marker({
              map: map,
              animation: google.maps.Animation.DROP,
              position: markerPos
          });
          var infoWindowContent = "<a href='#/tab/borrow/findLender/"+$scope.owned_deviceID+"/"+$scope.charger_id+"/"+$scope.num_min_borrow+"/"+ record.id +"'>" + record.first_name + " " + record.last_name + "</a>";          
 
          addInfoWindow(marker, infoWindowContent, record);
 
        }
 
      }); 
 
  }
 
  function addInfoWindow(marker, message, record) {
 
      var infoWindow = new google.maps.InfoWindow({
          content: message
      });
 
      google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open(map, marker);
      });
 
  }

  //Wait until the map is loaded
  google.maps.event.addListenerOnce($scope.map, 'idle', function(){
    loadMarkers();
    // var marker = new google.maps.Marker({
    //     map: $scope.map,
    //     animation: google.maps.Animation.DROP,
    //     position: myLatlng
    // });      
   
    // var infoWindow = new google.maps.InfoWindow({
    //   content: "Here I am!"
    // });
 
    // google.maps.event.addListener(marker, 'click', function () {
    //     infoWindow.open($scope.map, marker);
    // });

  });


})


.controller('BorrowLenderSelected', function($scope, $stateParams, Owned_Devices, Users_By_Charger, $window) {
  owned_deviceID = $stateParams.owned_deviceID;
  num_min_borrow = $stateParams.borrowTime;
  charger_id = $stateParams.charger_id;
  lender_id = $stateParams.lender_id;
  console.log("OWNED DEVICE ID, this is the id  of the owned device that needs a charger");
  console.log($stateParams.owned_deviceID);
  console.log("charger ID, this is the id  of the charger so you can look for other users who have it");
  console.log($stateParams.owned_deviceID);
  console.log("this is the # misn it needs to be borrowed for");
  console.log(num_min_borrow);
  console.log("this is the user id of the lender you have selected");
  console.log(lender_id);



})

.controller('LendCtrl', function($scope, Logout, Devices, Chargers, Owned_Devices, $window, $location, Auth, $ionicPopup) {
  // $scope.settings = {
  //   enableLending: true
  // };
  $scope.userId = $window.localStorage['userId'];
  $scope.userFirstName = $window.localStorage['userFirstName'];
  $scope.editPressed = false;

  Devices.query().$promise.then(function(response){
    $scope.devices = response;
    // console.log($scope.devices);
  });
  Chargers.query().$promise.then(function(response){
    $scope.chargers = response;
    // console.log($scope.chargers);
  });
  Owned_Devices.query().$promise.then(function(response){
    $scope.owned_devices = response;
  });

  $scope.editClicked = function(){
    if ($scope.editPressed === false) {
      $scope.editPressed = true;
    }
    else{
      $scope.editPressed = false;
    }
  };

  $scope.toggleChange = function(owned_device) {
      //if toggle changed value, update the database to reflect that change
      //I think the toggle in view automatically changes the value of allow_lending
      Owned_Devices.update({id: owned_device.id, allow_lending: owned_device.allow_lending},
        function(data){
        },
        function(err){
          var error = "";
          var errors = err["data"]["errors"];
          for (var k in errors) {
            error += k.charAt(0).toUpperCase() + k.replace(/_/g, ' ').substring(1) + ' ' + errors[k] + '. ';
          }
          var confirmPopup = $ionicPopup.alert({
            title: 'An error occured',
            template: error
          });
        }
      );
      console.log('id:' + owned_device.id + 'testToggle changed to ' + owned_device.allow_lending);
  };

  $scope.logout = function() {
    // This database call might not be necessary, if all that's needed is to removeItems...
    Logout.delete(
      function(data){
        $window.localStorage.removeItem('userToken');
        $window.localStorage.removeItem('userEmail');
        $window.localStorage.removeItem('userId');
        $window.localStorage.removeItem('userFirstName');
        //Reload all controllers
        $window.location.reload();  
        $location.path('/login');
      },
      function(err){
        var error = err["data"]["errors"] || err["data"]["errors"].join('. ')
        var confirmPopup = $ionicPopup.alert({
          title: 'An error occured',
          template: error
        });
      }
    );
  }
})


.controller('TransactionCtrl', function($scope, Transactions) {
    Transactions.query().$promise.then(function(response){
    $scope.transactions = response;
    console.log($scope.transactions);
  });
})


.controller('LendDetailCtrl', function($scope, $stateParams, $window, $filter, Owned_Devices) {
  // $stateparams access the parameter that was passed through the url
  // defined in app.js lend_detail state
  owned_deviceID = $stateParams.owned_deviceID;
  console.log("OWNED DEVICE ID");
  console.log($stateParams.owned_deviceID);
  
  // Not sure if we can pass in a parameter (1) like that for query
  //*** don't think we can, it just returns the whole endpoint anyways
  Owned_Devices.query(1).$promise.then(function(response){
    $scope.owned_devices = response;
    console.log($scope.owned_devices);
  });

  //.get currently gets devices by userId, not device_id
  // owned_devices = Owned_Devices.get(1);//$window.localStorage['userId']);

  // (failed) Attempt to convert json to array.
  // owned_devices_array = [];
  // angular.forEach(owned_devices, function(element) {
  //   owned_devices_array.push(element);
  // });
  // $scope.owned_device = $filter('filter')(owned_devices_array, {id: owned_deviceID}, true)

})


.controller('LoginCtrl', function($scope, $location, Auth, $window, Login, $ionicPopup, $rootScope, Register) {
  $scope.data = {};

  $scope.login = function() {
    Login.save({user: $scope.data.user},
      function(data){
        Auth.set(data);
        $location.path('/tab/borrow');
          console.log("START")
          // console.log($window.localStorage['userEmail'])
          console.log($scope.data.user)
          // console.log("Data:", data)
          console.log(data.user_token)
          console.log(data.token)
          console.log(data.user_email)
          console.log($window.localStorage['userEmail'])
          console.log($window.localStorage['userToken'])


          console.log("END")
      },
      function(err){
        var confirmPopup = $ionicPopup.alert({
          title: 'An error occured',
          template: "Invalid username or password."
        });
      }
    );
  }
})


.controller('RedirectCtrl', function($scope, $location, $window,$rootScope) {
    $scope.$on('$ionicView.enter', function () {
      //Is this the most secure way to do this?
      var email = $window.localStorage['userEmail'];
      // console.log("Inside RedirectCtrl:")
      // console.log(email)
      if (email) {
          //user already logged in
          $location.path('/tab/lend');
      } else {
        //user not logged in
        $location.path('/login');
      }
    });
})


.controller('UserDetailCtrl', function($scope, $stateParams, $window, $filter, $ionicPopup, Users, UpdateUsers, Auth, $location) {
  // $stateparams access the parameter that was passed through the url
  // defined in app.js lend_detail state
  userId = 6 //$stateParams.userId;
  $scope.data = {}
  $scope.data.user = Users.get(6)

  $scope.update = function(){
    UpdateUsers.update({id: userId,
     first_name: $scope.data.user.first_name, last_name: $scope.data.user.last_name},
      function(data){
        Auth.set({user_email: data.user_email});
        $location.path('/tab/lend');
      },
      function(err){
        var error = "";
        var errors = err["data"]["errors"];
        for (var k in errors) {
          error += k.charAt(0).toUpperCase() + k.replace(/_/g, ' ').substring(1) + ' ' + errors[k] + '. ';
        }
        var confirmPopup = $ionicPopup.alert({
          title: 'An error occured',
          template: error
        });
      }
    );
  }
})


.controller('RegisterCtrl', function($scope, $location, Auth, $window, Register, $ionicPopup, $rootScope) {
$scope.data = {};

$scope.register = function() {
  Register.save({user: $scope.data.user},
    function(data){
      Auth.set({user_token: data.user_token,
                user_email: data.user_email});
      $location.path('/tab/borrow');
    },
    function(err){
      var error = "";
      var errors = err["data"]["errors"];
      for (var k in errors) {
        error += k.charAt(0).toUpperCase() + k.replace(/_/g, ' ').substring(1) + ' ' + errors[k] + '. ';
      }
      var confirmPopup = $ionicPopup.alert({
        title: 'An error occured',
        template: error
      });
    }
  );
}
})




















// /mobile/www/controllers.js
// .controller('LoginCtrl', function($scope, $location, UserSession, $ionicPopup, $rootScope) {
// $scope.data = {};

// $scope.login = function() {
//   var user_session = new UserSession({ user: $scope.data });
//   user_session.$save(
//     function(data){
//       window.localStorage['userId'] = data.id;
//       window.localStorage['userName'] = data.name;
//       $location.path('/tab/borrow');
//     },
//     function(err){
//       var error = err["data"]["error"] || err.data.join('. ')
//       var confirmPopup = $ionicPopup.alert({
//         title: 'An error occured',
//         template: error
//       });
//     }
//   );
// }
// })



.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
