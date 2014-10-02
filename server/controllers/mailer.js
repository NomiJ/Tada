var nodemailer = require('nodemailer'),
    config = require('../config');

module.exports = function (opt, cb) {
    var transporter = nodemailer.createTransport({
        service: config.email.service,
        auth: {
            user: config.email.user,
            pass: config.email.pass
        }
    });
    opt.from = config.appName+" <no-reply@"+config.email.name+".com>";
    transporter.sendMail(opt, cb);
};