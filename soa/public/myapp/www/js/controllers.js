angular.module('starter.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
  $scope.registerData = {};

  $scope.result = "";	
  $scope.register_result = "";

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $rootScope.modal = modal;
  });

  // Triggered in the login modal to close it
  $rootScope.closeLogin = function() {
    $rootScope.modal.hide();

    $rootScope.loginData = {};
    $rootScope.registerData = {};

    $rootScope.result = ""
    $rootScope.register_result = "";
  };

  // Open the login modal
  $rootScope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $rootScope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
	/*
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
	*/

	var url = encodeURI("/core/user/login?phone_id=" + $scope.loginData.phone_id + "&password=" + $scope.loginData.password);
	console.log(url)

	$http.get(url).success(function(data) {
		console.log(data[0].is_match);

		if (data[0].is_match == 1) {

			$rootScope.phone_id = $scope.loginData.phone_id;
			$rootScope.password=  $scope.loginData.password;
			$rootScope.username = data[0].username;
			$rootScope.picture  = data[0].picture;
			$rootScope.Islogin  = 1;


      		$scope.closeLogin();

			console.log($rootScope.phone_id);
		} else {
			$scope.result = "用户名或密码错误";	
		}
	});
  };

  $rootScope.login_out = function() {

	  $rootScope.phone_id = "";
	  $rootScope.password=  "";
	  $rootScope.username = "";
	  $rootScope.picture  = "";

	  $scope.loginData = {};

	  $rootScope.Islogin  = 0;
  };



  $rootScope.doRegister = function() {

	console.log($scope.registerData.sex);
	var picture_id = 0;
	var myDate = new Date();

	if ($scope.registerData.sex == 'male') {

		picture_id = parseInt(myDate.getMilliseconds())%10; 
	} else {
	
		$scope.registerData.sex = 'female';

		picture_id = parseInt(myDate.getMilliseconds())%10 + 10000; 
	}
  
	if ($scope.registerData.phone_id == ""  || $scope.registerData.phone_id.length != 11) {
	
		$scope.register_result = "请输入正确的手机号码";	
		return;
	}

	if ($scope.registerData.password == "") {
	
		$scope.register_result = "请输入正确的密码";	
		return;
	}

	var url = encodeURI("/core/user/add?phone_id=" + $scope.registerData.phone_id + "&password=" + $scope.registerData.password 
		+ "&username=" + $scope.registerData.username + "&picture=img/" + picture_id + ".jpg" + "&sex=" + $scope.registerData.sex);
	console.log(url)

	$http.get(url).success(function(data) {
		console.log(data);

		if (data.affectedRows == 1) {

			$rootScope.phone_id = $scope.registerData.phone_id;
			$rootScope.password = $scope.registerData.password;
			$rootScope.username = $scope.registerData.username;
			$rootScope.picture  = "img/" + picture_id + ".jpg";
			$rootScope.Islogin  = 1;

      		$scope.closeLogin();
		} else {
			$scope.register_result = "用户名重复注册";	
		}
	});
  };



  $scope.my_bill = function() {

	  if ($rootScope.Islogin != 1) {
		$rootScope.login();
  	  } else {
		  window.location.href = "#/app/mybill";
	  }
  };
})

.controller('PlaylistsCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http) {
  $scope.playlists = [
    
  ];


  $scope.bill = {};
  $scope.bill.group_id   = 1;
  $scope.bill.group_name = '淞虹路';

  $scope.create_result = "";

  $scope.bill_init = function() {

	  $scope.playlists = {};
  
	  var url = encodeURI("/core/bill/get?group_id=" + $scope.bill.group_id);
	  console.log(url)

	  $http.get(url).success(function(data) {
		  console.log(data);
		  $scope.playlists = data;
	  })
	 .finally(function() {
		  // 停止广播ion-refresher
		  $scope.$broadcast('scroll.refreshComplete');
	  })
  };

  $scope.bill_init();

  $scope.getData = function() {
  	$scope.bill_init();
  };

    // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/bill_create.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeBill = function() {
    $scope.modal.hide();
  };

  /*
  $scope.login = function() {
    $scope.modal.show();
  };
  */

  $scope.create_bill = function() {

	if ($rootScope.Islogin != 1) {
		$rootScope.login();
	} else {
	
		$scope.modal.show();
	}
  };

  $scope.create_bill_on = function() {

	/*
    $timeout(function() {
      $scope.closeBill();
  	  $scope.bill_init();
    }, 2000);
	*/

	console.log(Date.parse($scope.bill.start_time));
	console.log(Date.parse(Date()));

	console.log(parseInt(Date.parse($scope.bill.start_time)) - parseInt(Date.parse(Date())));

	if ((parseInt(Date.parse($scope.bill.start_time)) - parseInt(Date.parse(Date()))) >=  (24 * 60 * 60 * 1000000 * 2)) {

		$scope.create_result = "请输入两天内时间";	
		return;
	}

	if ((parseInt(Date.parse($scope.bill.start_time)) - parseInt(Date.parse(Date()))) <=  0) {
		$scope.create_result = "请输入两天内时间";	
		return;
	}



	if ($scope.bill.group_id == undefined || $scope.bill.bill_name == undefined || $scope.bill.s_from == undefined || $scope.bill.s_to == undefined || $scope.bill.seat_number == undefined) {
			
		$scope.create_result = "请输入全部信息";	
		return;
	}

	console.log($scope.bill.start_time);

	//
	var url = encodeURI("/core/bill/add?group_id=" + $scope.bill.group_id+ "&bill_name=" + $scope.bill.bill_name + "&s_from=" + $scope.bill.s_from + "&s_to=" + $scope.bill.s_to + "&seat_number=" + $scope.bill.seat_number + "&start_time=" + new Date($scope.bill.start_time) + "&s_type=driver"
		+ "&phone_id=" + $rootScope.phone_id);
	console.log(url)

	$http.get(url).success(function(data) {
		console.log(data);

		$scope.closeBill();
  	  	$scope.bill_init();
	});
  };


  $scope.doRefresh = function() {
  	  $scope.bill_init();
  };


  /*chosen group*/

  $scope.set_group_name = function () {
  	  $scope.bill.group_name = '淞虹路';
  };

  $ionicModal.fromTemplateUrl('templates/group.html', {
		  scope: $scope
  }).then(function(modal) {
	  $scope.group_modal = modal;
  });

  $scope.close_group = function() {
	 $scope.group_modal.hide();

	 $scope.bill_init();
  };

  $scope.chosen_group = function() {

	  $scope.group_modal.show();
  };

  $scope.close_group_set_name = function(name) {

  	  $scope.bill.group_name = name;

	  $scope.close_group();
  }

  
})

.controller('PlaylistCtrl', function($rootScope, $scope, $stateParams, $timeout, $http) {

	console.log($stateParams.playlistId);

	$scope.playlist = {};

	$scope.bill = {};
	$scope.bill_join_list = {};

  	$scope.bill.group_id = 1;

    $scope.init_bill_show = function() {

		var url = encodeURI("/core/bill/get_one?group_id=" + $scope.bill.group_id + "&bill_id=" + $stateParams.playlistId);
	  	console.log(url)

		$http.get(url).success(function(data) {
			  console.log(data);
			  $scope.playlist = data[0];
	    });
	
	};

	$scope.init_bill_join_show = function() {
	
		var url = encodeURI("/core/bill_join/get?bill_id=" + $stateParams.playlistId);
	  	console.log(url)

		$http.get(url).success(function(data) {
			  console.log(data);
			  $scope.bill_join_list = data;
	    });

	};


	$scope.init_bill_show();
	$scope.init_bill_join_show();

	$scope.bill_join = function() {

		console.log("bill join");

		if ($rootScope.Islogin != 1) {
			$rootScope.login();
		} else {

			var url = encodeURI("/core/bill_join/add?bill_id=" + $stateParams.playlistId + "&phone_id=" + $rootScope.phone_id + "&username=" + $rootScope.username + "&picture=" + $rootScope.picture);
			console.log(url)

			$http.get(url).success(function(data) {
				console.log(data);
				$scope.init_bill_join_show();
			});

		}
	};

})


.controller('mybill', function($rootScope, $scope, $ionicModal, $timeout, $http) {
  $scope.playlists = [
    
  ];

  $scope.bill_join = [];


  $scope.bill = {};
  $scope.bill.group_id = 1;




  $scope.bill_init = function() {
  
	  var url = encodeURI("/core/bill/get_my?group_id=" + $scope.bill.group_id) + "&phone_id=" + $rootScope.phone_id;
	  console.log(url)

	  $http.get(url).success(function(data) {
		  console.log(data);
		  $scope.playlists = data;
	  })
      .finally(function() {
		  // 停止广播ion-refresher
		  $scope.$broadcast('scroll.refreshComplete');
	  });



	  var url = encodeURI("/core/bill/get_my_join?group_id=" + $scope.bill.group_id) + "&phone_id=" + $rootScope.phone_id;
	  console.log(url)

	  $http.get(url).success(function(data) {
		  console.log(data);
		  $scope.bill_join = data;
	  })
      .finally(function() {
		  // 停止广播ion-refresher
		  $scope.$broadcast('scroll.refreshComplete');
	  });
  };

  $scope.bill_init();

  $scope.getData = function() {
  	$scope.bill_init();
  };

    // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/bill_create.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeBill = function() {
    $scope.modal.hide();
  };



  if ($rootScope.Islogin != 1) {
		$rootScope.login();
  }

  /*
  $scope.login = function() {
    $scope.modal.show();
  };
  */

});

