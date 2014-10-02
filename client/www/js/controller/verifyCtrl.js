app.controller('verifyCtrl', function ($rootScope, $scope, $stateParams, $state, userService) {
    if (!userService.verify) return $state.go("app.home");
    $scope.verify = function () {
        if (!$scope.code) return $scope.$emit('showAlert', {type: 'danger', msg: "Enter verify code"});
        userService.verifyCode($scope.code, function (data) {
            $scope.$emit('showAlert', {type: 'success', msg: "Your email has verified!"});
            $state.go("app.login")
        }, function (err) {
            $scope.$emit('showAlert', {type: 'danger', msg: "Your code is invalid or expired"});
            console.log(err)
        })
    };
    $scope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            userService.verify = false
        })
});