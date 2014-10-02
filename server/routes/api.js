var express = require('express'),
    router = express.Router(),
    api = require('../controllers/api');

router.post("/register", api.register);
router.post("/resendVerifyCode", api.resendVerifyCode);
router.post("/login", api.login);
router.post("/verify", api.verifyEmail);

router.all('*', function (req, res) {
    res.status(400).json({msg: 'invalid api'})
});

module.exports = router;