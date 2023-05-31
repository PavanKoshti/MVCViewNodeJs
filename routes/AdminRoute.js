const express = require('express');
const adminRouter = express();
adminRouter.set('view engine', 'ejs');
adminRouter.set('views', './views/admin');
const upload = require('../middleware/uploadPhoto');
const { isLogout, isLogin } = require('../middleware/adminAuth');
const { loadAdminLoginView, loadAdminRegisterView, addAdmin, verifyLoginAdmin, loadAdminHomeView, loadAdminLogoutView, verifyMail, loadAdminForgetView, forgetVerifyMail, loadAdminForgetPwdView, resetPassword, reVerificationAdminMailView, sendReVerificationMail, loadAdminEditView, updateAdminProfile, loadAdminDashboardView, loadAdminCreateNewUserView, adminCreateNewUser, loadAdminUserEditView, adminUserUpdateProfile, adminUserDelete, downloadCSVFileData, downloadPDFFileData } = require('../controllers/adminConList');

adminRouter.get('/', isLogout, loadAdminLoginView);

adminRouter.get('/register', isLogout, loadAdminRegisterView);

adminRouter.post('/register', upload, addAdmin);

adminRouter.get('/verify', verifyMail);

adminRouter.post('/', verifyLoginAdmin);

adminRouter.get('/home', isLogin, loadAdminHomeView);

adminRouter.get('/logout', isLogin, loadAdminLogoutView);

adminRouter.get('/forget', isLogout, loadAdminForgetView);

adminRouter.post('/forget', forgetVerifyMail);

adminRouter.get('/forget-password', isLogout, loadAdminForgetPwdView);

adminRouter.post('/forget-password', resetPassword);

adminRouter.get('/reverification', reVerificationAdminMailView);

adminRouter.post('/reverification', sendReVerificationMail);

adminRouter.get('/edit', isLogin, loadAdminEditView);

adminRouter.post('/edit', isLogin, upload, updateAdminProfile);

adminRouter.get('/dashboard', isLogin, loadAdminDashboardView);

adminRouter.get('/new-user', isLogin, loadAdminCreateNewUserView);

adminRouter.post('/new-user', upload, adminCreateNewUser);

adminRouter.get('/edit-user', isLogin, loadAdminUserEditView);

adminRouter.post('/edit-user', isLogin, adminUserUpdateProfile);

adminRouter.get('/delete-user', isLogin, adminUserDelete);

adminRouter.get('/export-users-csv', isLogin, downloadCSVFileData);

adminRouter.get('/export-users-pdf', isLogin, downloadPDFFileData);

adminRouter.get('*', (req, res) => {
    res.redirect('/admin');
});

module.exports = adminRouter;