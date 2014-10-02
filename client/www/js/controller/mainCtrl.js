app.controller('mainCtrl', function ($scope, $state, userService) {
    function getUser() {
        userService.socket
            .connect()
            .onUser(function (user) {
                if(user.success){
                    $scope.user = user;
                    $scope.$$phase || $scope.$digest()
                }
            })
            .onDisconnect(function () {
                $state.go('app.home');
                $scope.user = false;
                $scope.$$phase || $scope.$digest()
            })
        ;
    }

    getUser();

    $scope.logout = function () {
        userService.socket.disconnect();
        $scope.user = false;
        $scope.$$phase || $scope.$digest();
    };

    $scope.resendCode = function () {
        $scope.$emit('removeAlert');
        userService.resendVerifyCode(function (data) {
            if (data.msg) $scope.$emit('showAlert', {type: 'info', msg: data.msg + " <a href onclick='angular.element(this).scope().resendCode()'>Click here</a> to resend code"});
            userService.verify = true;
            $state.go('app.verify')
        })
    };

    $scope.$on('user', function (e,is) {
        if(!is) {
            $scope.user = is;
            $scope.$$phase || $scope.$digest()
        }
        else getUser()
    })
});