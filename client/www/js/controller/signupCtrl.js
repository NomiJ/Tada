app.controller('signupCtrl', function ($rootScope, $scope, $state, userService) {
    $scope.user = {};
    $scope.signup = function () {
        var user = $scope.user, alert = {msg: ''};
        if (!userService.validateEmail(user.email))
            alert.msg += "Email is not valid!\n";
        if ((user.password && !(user.password.length >= 4)) || !user.password)
            alert.msg += "Password must be at least 4 characters long\n";
        if (user.password !== user.cPassword || !user.password)
            alert.msg += "Password do not match\n";
        if (alert.msg) {
            alert.type = 'danger';
            $scope.$emit('showAlert', alert);
        } else {
            $scope.$emit('removeAlert');
            userService.register(user, function (data) {
                if (data.msg) $scope.$emit('showAlert', {type: 'info', msg: data.msg + " <a href onclick='angular.element(this).scope().resendCode()'>Click here</a> to resend code"});
                userService.verify = true;
                $state.go('app.verify')
            }, function (err) {
                if (err.msg) $scope.$emit('showAlert', {type: 'danger', msg: err.msg});
                console.log(err)
            })
        }
    }
});