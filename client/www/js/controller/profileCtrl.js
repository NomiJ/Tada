app.controller('profileCtrl', function ($scope, $state, userService) {
    userService.socket
        .onUser(function (user) {
            if(user.update){
                $scope.$emit('showAlert',{type:'success',msg:'Profile updated'});
                $scope.$$phase || $scope.$digest()
            }
        })
        .onPassword(function (data) {
            $scope.$emit('showAlert',{type:data.success?'success':'danger',msg:data.msg});
             $scope.$$phase || $scope.$digest()
        })
    ;

    $scope.updateProfile = function () {
        userService.socket.updateProfile($scope.user.profile)
    };

    $scope.getPicture = function (img) {
        var reader = new FileReader();

        reader.onload = function () {
            $scope.user.profile.picture = reader.result;
            $scope.$$phase || $scope.$digest()
        };

        reader.readAsDataURL(img[0]);
    };

    $scope.changePassword = function () {
        var alert = {msg: ''};
        if (!$scope.password.oldPassword)
            alert.msg += "Enter Old Password\n";
        if (!$scope.password.newPassword || $scope.password.newPassword.length < 4)
            alert.msg += "Password must be at least 4 characters long\n";
        if (!$scope.password.newPassword || $scope.password.newPassword !== $scope.password.confirmPassword)
            alert.msg += "Password do not match\n";
        if (alert.msg) {
            alert.type = 'danger';
            $scope.$emit('showAlert', alert);
        }
        else {
            $scope.$emit('removeAlert');
            userService.socket.changePassword({oldPassword: $scope.password.oldPassword, newPassword: $scope.password.newPassword});
        }
        $scope.password = {};
    };
    $scope.removeAccount = userService.socket.removeAccount;
});