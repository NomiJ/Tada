app.service('userService', function ($state, $http, mainService) {
    var self = this, token = localStorage.token || '', base = mainService.baseURL || '';

    function log() {
        console.log.apply(console, arguments)
    }

    function getToken() {
        return self.token || localStorage.token
    }

    function logout() {
        delete localStorage.token;
        delete self.token;
    }

    self.isLogin = function () {
        return !!(self.token||localStorage.token)
    };

    self.validateEmail = function (email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    self.login = function (user, success, error) {
        $http.post(base + '/api/login', user)
            .success(function (data) {
                self.token = localStorage.token = data.token;
                if (typeof success === "function")
                    success(data)
            })
            .error(function (err) {
                if (typeof error == "function")
                    error(err);
            });
    };

    self.register = function (user, success, error) {
        $http.post(base + '/api/register', user)
            .success(function (data) {
                self.email = user.email;
                if (typeof success === "function")
                    success(data)
            })
            .error(function (err) {
                if (typeof error == "function")
                    error(err);
            });
    };

    self.verifyCode = function (code, success, error) {
        $http.post(base + '/api/verify', {code: code})
            .success(function (data) {
                if (typeof success === "function")
                    success(data)
            })
            .error(function (err) {
                if (typeof error == "function")
                    error(err);
            });
    };

    self.resendVerifyCode = function (success, error) {
        $http.post(base + '/api/resendVerifyCode', {email: self.email})
            .success(function (data) {
                if (typeof success === "function")
                    success(data)
            })
            .error(function (err) {
                if (typeof error == "function")
                    error(err);
            });
    };

    var socket, _onPassword = [], _password, _onUser = [], _user, _onDisconnect = [], _disconnect;

    self.socket = {};

    self.socket.onPassword = function (cb) {
        if (typeof cb === "function")
            _onPassword.push(cb);
        return self.socket
    };
    _password = function () {
        var args = arguments;
        _onPassword.forEach(function (cb) {
            cb.apply(null, args)
        })
    };

    self.socket.onUser = function (cb) {
        if (typeof cb === "function")
            _onUser.push(cb);
        return self.socket
    };
    _user = function () {
        var args = arguments;
        _onUser.forEach(function (cb) {
            cb.apply(null, args)
        })
    };

    self.socket.onDisconnect = function (cb) {
        if (typeof cb === "function")
            _onDisconnect.push(cb);
        return self.socket
    };
    _disconnect = function () {
        var args = arguments;
        _onDisconnect.forEach(function (cb) {
            cb.apply(null, args)
        })
    };
    self.socket.connect = function (token) {
        token = token || getToken();
        if (!token) {
            $state.go('app.login');
            return self.socket
        }
        if (socket && socket.connected) return self.socket;
        socket = io.connect(base, {
            query: {token: token},
            'forceNew': true
        });
        socket
            .on('connect', function () {
                log("connected")
            })
            .on('disconnect', function () {
                _disconnect();
                log("disconnect")
            })
            .on('exit', function (msg) {
                socket.disconnect();
                logout();
                log(msg)
            })
            .on('changePassword', function (data) {
                _password(data);
                log(data)
            })
            .on('getUser', function (user) {
                if (user.success) {
                    self.user=user;
                }
                _user(user);
                log(user)
            })
            .on("error", function (error) {
                if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
                    socket.disconnect();
                    $state.go('app.login');
                    logout();
                    log("User's token has expired");
                }
            })
            .on("deleteAccount", function (data) {
                if (data.success) {
                    $state.go('app.login');
                    socket.disconnect();
                    logout();
                    log(data.msg);
                }
            })
        ;
        return self.socket
    };
    self.socket.getUser = function () {
        if (socket) socket.emit('getUser');
        return self.socket
    };
    self.socket.changePassword = function (obj) {
        if (socket && obj) socket.emit('changePassword', obj);
        return self.socket
    };
    self.socket.updateProfile = function (obj) {
        if (socket && obj) socket.emit('updateProfile', obj);
        return self.socket
    };
    self.socket.removeAccount = function (obj) {
        if (socket) socket.emit('deleteAccount');
        return self.socket
    };
    self.socket.disconnect = function () {
        if (socket) socket.disconnect();
        logout();
        log("disconnected");
        return self.socket
    }
});