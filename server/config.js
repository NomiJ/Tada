module.exports = {

    port: process.env.PORT || 8080,

    appName:"UserManagementApp",

    db: process.env.MONGODB || 'mongodb://localhost:27017/user-management', //mongodb://user:111111@ds039860.mongolab.com:39860/user-management

    email: {
        name:'UserManagement',
        service: process.env.MAIL_SERVICE || 'SendGrid',
        user: process.env.MAIL_USER || 'hslogin',
        pass: process.env.MAIL_PASS || 'hspassword00'
    },

    secret: "User-Management-App"
};
