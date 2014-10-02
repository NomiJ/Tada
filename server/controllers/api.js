var User = require('../models/User'),
    jwt = require('jsonwebtoken'),
    config = require('../config'),
    crypto = require('crypto'),
    validator = require('validator'),
    sendMail = require('./mailer');

function sendVerification(user, res, next, isReset) {
    crypto.randomBytes(3, function (err, buf) {
        if (err) return next(err);
        var code = buf.toString('hex');
        if (isReset) {
            user.resetPasswordToken = code;
            user.resetPasswordExpires = Date.now() + 3600000;
        }
        else {
            user.verify.code = code;
            user.verify.expires = Date.now() + 3600000;
        }
        user.save(function (err) {
            if (err) return next(err);
            sendMail({
                    to: user.email,
                    subject: isReset ? 'Reset your Password on User Management App' : "Email confirmation via User Management App",
                    text: isReset ? 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'Your verification code is: ' + code + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.' : "Thank you for registration!\n\nYour verification code is: " + code
                },
                function (err) {
                    if (err) return next(err);
                    res.status(200).json({msg: 'An E-mail has been sent to ' + user.email + ' for E-mail verification.'});
                });
        })
    })
}

exports.login = function (req, res, next) {
    var error = {msg: ''};
    if (!validator.isEmail(req.body.email) || !validator.isLength(req.body.email, 4, 50))
        error.msg += 'Email is not valid\n';
    if ((req.body.password && !validator.isLength(String(req.body.password), 4, 64)) || !req.body.password)
        error.msg += 'Password must be at least 4 characters long\n';

    if (error.msg) return res.status(400).json(error);

    User.findOne({email: req.body.email}, function (err, user) {
        if (err) return next(err);
        if (!user) return res.status(404).json({msg: 'User not exist'});
        if (!user.verify.isVerified) return res.status(400).json({verifyError: true, msg: 'Email is not verified'});
        user.comparePassword(String(req.body.password), function (err, isMatch) {
            if (!isMatch)
                return res.status(404).json({msg: 'Email or Password is invalid'});
            var token = jwt.sign({
                id: user._id,
                email: user.email
            }, config.secret, { expiresInMinutes: 60 * 24 });

            res.status(200).json({token: token});
        })
    })
};

exports.register = function (req, res, next) {
    var error = {msg: ''};
    if (!validator.isEmail(req.body.email) || !validator.isLength(req.body.email, 4, 50))
        error.msg += 'Email is not valid\n';
    if ((req.body.password && !validator.isLength(String(req.body.password), 4, 64)) || !req.body.password)
        error.msg += 'Password must be at least 4 characters long\n';

    if (error.msg) return res.status(400).json(error);
    var user = new User({
        email: req.body.email,
        password: String(req.body.password),
        verify: {}
    });
    User.findOne({email: user.email}, function (err, exist) {
        if (err) return next(err);
        if (exist) {
            error.msg = "Account with that email address already exists.";
            return res.status(400).json(error)
        }
        sendVerification(user, res, next);
    })
};

exports.verifyEmail = function (req, res, next) {
    if (!req.body.code || (req.body.code && !validator.isLength(String(req.body.code), 6,10)))
        return res.status(400).json({msg: 'invalid code'});
    User.findOne({'verify.code': String(req.body.code), 'verify.expires': {$gt: Date.now()}}, function (err, user) {
        if (err) return next(err);
        if (!user) return res.status(404).json({msg: 'verify code is invalid or expired'});
        user.verify.isVerified = true;
        user.verify.code = '';
        user.save(function (err) {
            if (err) return next(err);
            res.status(200).json({success: true, msg: 'email verified'})
        })

    })
};

exports.resendVerifyCode = function (req, res, next) {
    var error = {msg: ''};
    if (!validator.isEmail(req.body.email) || !validator.isLength(req.body.email, 4, 50))
        error.msg += 'Email is not valid\n';

    if (error.msg) {
        return res.status(400).json(error)
    }
    User.findOne({email: req.body.email}, function (err, user) {
        if (err) return next(err);
        if (!user) {
            error.msg = "Account with that email address not found.";
            return res.status(404).json(error)
        }

        sendVerification(user, res, next)
    })
};