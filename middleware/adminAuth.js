module.exports = {

    isLogin: async (req, res, next) => {
        try {
            if (req.session.admin_id) {

            } else {
                res.redirect('/admin');
            }
            next();
        } catch (error) {
            console.log("Error While Is Admin Login --> ", error);
        }
    },

    isLogout: async (req, res, next) => {
        try {
            if (req.session.admin_id) {
                res.redirect('/admin/home');
            }
            next();
        } catch (error) {
            console.log("Error While Is Admin Logout --> ", error);
        }
    }

}