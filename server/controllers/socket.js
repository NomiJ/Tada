module.exports = function (server) {
    var io = require('socket.io').listen(server),
        jwt = require('socketio-jwt'),
        config = require('../config'),
        User = require('../models/User');

    io.use(jwt.authorize({
        secret: config.secret,
        handshake: true
    }));

    io.sockets.on('connection', function (socket) {
        var du = socket.decoded_token, self = this;
        User.findOne({_id: du.id}, function (err, user) {
            if (err) return socket.emit('exit', err);
            if (!user) socket.emit('exit', 'user not found')
        });

        function getUser() {
            User.findById(du.id, function (err, user) {
                if (err) {
                    err.error = true;
                    return socket.emit('getUser', err);
                }
                if(!user) return socket.emit('exit', 'user not found');
                socket.emit('getUser', {success: true, email:user.email, profile: user.profile});
            });
        }
        getUser();

        socket.on('getUser', function () {
            getUser()
        });

        socket.on('updateProfile', function (obj) {
            if (!obj) return;
            User.findById(du.id, function (err, user) {
                if (err) {
                    err.error = true;
                    return socket.emit('getUser', err);
                }
                if (obj.name)
                    user.profile.name = String(obj.name);
                if (obj.gender)
                    user.profile.gender = String(obj.gender);
                if (obj.location)
                    user.profile.location = String(obj.location);
                if (obj.picture)
                    user.profile.picture = String(obj.picture);
                user.save(function (err) {
                    if (err) {
                        err.error = true;
                        return socket.emit('getUser', err);
                    }
                    socket.emit('getUser', {success: true, update:true, email:user.email, profile: user.profile});
                })
            });
        });

        socket.on('changePassword', function (obj) {
            if (!obj || !obj.oldPassword || !obj.newPassword || obj.newPassword.length < 4) {
                return socket.emit('changePassword', {error: true, msg: 'invalid values'})
            }
            User.findById(du.id, function (err, user) {
                if (err) {
                    err.error = true;
                    return socket.emit('changePassword', err);
                }
                user.comparePassword(obj.oldPassword, function (err, isMatch) {
                    if (err) {
                        err.error = true;
                        return socket.emit('changePassword', err);
                    }
                    if (!isMatch) return socket.emit('changePassword', {error: true, msg: "Password does not match"});
                    user.password = String(obj.newPassword);
                    user.save(function (err) {
                        if (err) {
                            err.error = true;
                            return socket.emit('changePassword', err);
                        }
                        socket.emit('changePassword', {success: true, msg: 'Password change successful'})
                    })
                })

            });
        });

        socket.on('deleteAccount', function () {
            User.findById(du.id).remove().exec(function (err, user) {
                if (err) {
                    err.error = true;
                    return socket.emit('deleteAccount', err);
                }
                socket.emit('deleteAccount', {success: true, msg: 'account deleted successful'});
            });
        });
    });
};