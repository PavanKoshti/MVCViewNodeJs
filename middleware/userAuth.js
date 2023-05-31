module.exports = {

    isLogin: async (req, res, next) => {
        try {
            if (req.session.user_id) {

            } else {
                res.redirect('/');
            }
            next();
        } catch (error) {
            console.log("Error While Is User Login --> ", error);
        }
    },

    isLogout: async (req, res, next) => {
        try {
            if (req.session.user_id) {
                res.redirect('/home');
            }
            next();
        } catch (error) {
            console.log("Error While Is User Logout --> ", error);
        }
    }

}