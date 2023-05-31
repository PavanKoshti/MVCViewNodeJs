const express = require('express');
const userRouter = express();
userRouter.set('view engine', 'ejs');
userRouter.set('views', './views/users');
const upload = require('../middleware/uploadPhoto');
const { isLogout, isLogin } = require('../middleware/userAuth');
const { loadUserRegisterView, addUser, verifyMail, loadUserLoginView, verifyLoginUser, loadUserHomeView, loadUserLogoutView, forgetVerifyMail, loadUserForgetView, loadUserForgetPwdView, resetPassword, reVerificationUserMailView, sendReVerificationMail, loadUserEditView, updateUserProfile } = require('../controllers/userConList');

userRouter.get('/register', isLogout, loadUserRegisterView);

userRouter.post('/register', upload, addUser);

userRouter.get('/verify', verifyMail);

userRouter.get('/', isLogout, loadUserLoginView);

userRouter.get('/login', isLogout, loadUserLoginView);

userRouter.post('/login', verifyLoginUser);

userRouter.get('/home', isLogin, loadUserHomeView);

userRouter.get('/logout', isLogin, loadUserLogoutView);

userRouter.get('/forget', isLogout, loadUserForgetView);

userRouter.post('/forget', forgetVerifyMail);

userRouter.get('/forget-password', isLogout, loadUserForgetPwdView);

userRouter.post('/forget-password', resetPassword);

userRouter.get('/reverification', reVerificationUserMailView);

userRouter.post('/reverification', sendReVerificationMail);

userRouter.get('/edit', isLogin, loadUserEditView);

userRouter.post('/edit', isLogin, upload, updateUserProfile);

module.exports = userRouter;