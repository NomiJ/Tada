app.controller('loginCtrl', function ($scope, $state, userService) {
    $scope.user = {};
    $scope.login = function () {
        var user = $scope.user, alert = {msg: ''};
        if (!userService.validateEmail(user.email))
            alert.msg += "Email is not valid!\n";
        if ((user.password && !(user.password.length >= 4)) || !user.password)
            alert.msg += "Password must be at least 4 characters long\n";
        if (alert.msg) {
            alert.type = 'danger';
            $scope.$emit('showAlert', alert);
        } else {
            $scope.$emit('removeAlert');
            userService.login(user, function (data) {
                $scope.$emit('showAlert', {type: 'success', msg: "Login Success!"});
                $scope.$emit('user',true);
                $state.go('app.home')
            }, function (err) {
                if (err.verifyError) {
                    userService.email = user.email;
                    $scope.$emit('showAlert', {type: 'danger', msg: err.msg + " if you want to resend verification code <a href onclick='angular.element(this).scope().resendCode()'>Click here</a>"});
                } else if (err.msg) $scope.$emit('showAlert', {type: 'danger', msg: err.msg});
                console.log(err)
            })
        }
    };
});