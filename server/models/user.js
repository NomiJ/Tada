var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    email: { type: String, unique: true, lowercase: true },
    password: String,
    verify: {
        isVerified: {type: Boolean, default: false},
        code: String,
        expires: Date
    },

    profile: {
        name: { type: String, default: '' },
        gender: { type: String, default: '' },
        location: { type: String, default: '' },
        picture: { type: String, default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACMCAIAAAAhotZpAAABo0lEQVR4nO3dwQnCQBBAURWrsBPvdmAb3q3Bu+VYnC1sYJflwX/nkBA+cwnL5Py8306zPd7fwSt/n9f0p6+w940u0++Y6YoEKBKgSIAiAYoEKBKgSIAiAYoEKBKgSIAiAYoEKBKgSIAiAYoEKBKgSIAiAYoEKBKgSIAiAYoEKBLgvOIs+LjxM9Z77T2z3iQBigQoEqBIgCIBigQoEqBIgCIBigQoEqBIgCIBigQoEqBIgCIBigQoEqBIgCIBigQoEqBIgCIBigQoEqBIgCIBigQoEqBIgCIBigQoEqBIgCIBigQoEqBIgCIBDmxE2bu9ZMVOEuWNmiRAkQBFAhQJUCRAkQBFAhQJUCRAkQBFAhQJUCTAdcVN927RHqd8WW+SAEUCFAlQJECRAEUCFAlQJECRAEUCFAlQJECRAEu+giv/vFQ0SYAiAYoEKBKgSIAiAYoEKBKgSIAiAYoEKBKgSIADG1GyS5MEKBKgSIAiAYoEKBKgSIAiAYoEKBKgSIAiAYoEKBKgSIAiAYoEKBKgSIAiAYoEKBKgSIAiAYoEKBKgSIA/qHIYsSwdFnwAAAAASUVORK5CYII=' }
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(5, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', userSchema);