const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodeMailer = require('nodemailer');
const randomstring = require('randomstring');
const FS = require('fs');

module.exports = {

    loadUserRegisterView: async function (req, res) {
        try {
            res.render('registration');
        } catch (error) {
            console.log("Error While Get Load Register--> ", error);
        }
    },

    addUser: async function (req, res) {
        try {
            const securePassword = await bcrypt.hash(req.body.password, 10);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                image: req.file.filename,
                password: securePassword,
                is_admin: 0,
            });
            const userData = await user.save();

            if (userData) {
                sendVerifyMail(userData.name, userData.email, userData._id, 'RegisterMail');
                res.render('registration', { message: 'Your Registration has been Successfully, Please Verify Your Mail.' });
            }
            else {
                res.render('registration', { message: 'Your Registration has been Failed !' });
            }
        } catch (error) {
            console.log("Error While Get Add User--> ", error);
        }
    },

    verifyMail: async function (req, res) {
        try {

            const updateVerifyMail = await User.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } });
            if (updateVerifyMail.modifiedCount > 0 || updateVerifyMail.acknowledged == true) {
                res.render("email-verified");
            }
            else {
                console.log("MAIL ID IS InValid !");
            }
        } catch (error) {
            console.log("Error While Get Verify Mail--> ", error);
        }
    },

    loadUserLoginView: async function (req, res) {
        try {
            await res.render('login');
        } catch (error) {
            console.log("Error While Get loadUserLoginView --> ", error);
        }
    },

    verifyLoginUser: async function (req, res) {
        try {

            const userData = await User.findOne({ email: req.body.email });

            if (userData) {
                const matchPassword = await bcrypt.compare(req.body.password, userData.password);
                if (matchPassword) {
                    if (userData.is_varified === 0) {
                        res.render('login', { message: "Please Verify Your Mail !" });
                    }
                    else {
                        req.session.user_id = userData._id;
                        res.redirect('/home');
                    }
                }
                else {
                    res.render('login', { message: "Email and Password is InValid!" });
                }
            }
            else {
                res.render('login', { message: "Email and Password is InValid!" });
            }

        } catch (error) {
            console.log("Error While Get Verify Login User -->", error);
        }
    },

    loadUserHomeView: async function (req, res) {
        try {
            if (req.session.user_id != null || req.session.user_id != undefined || req.session.user_id != '') {
                let getUserData = await User.findById({ _id: req.session.user_id }).lean();
                getUserData.createDate = new Date(getUserData.created).toLocaleDateString();
                if (getUserData) {
                    res.render('home', { user: getUserData });
                }
            }
            else {
                res.render('/login');
            }

        } catch (error) {
            console.log("Error While Get Load User Home View --> ", error);
        }
    },

    loadUserLogoutView: async function (req, res) {
        try {
            req.session.destroy();
            res.redirect('/');
        } catch (error) {
            console.log("Error While Load Logout View --> ", error);
        }
    },

    loadUserForgetView: async function (req, res) {
        try {
            res.render('forget');
        } catch (error) {
            console.log("Error While Load Forget View --> ", error);
        }
    },

    forgetVerifyMail: async function (req, res) {
        try {
            let checkMail = await User.findOne({ email: req.body.email });
            if (checkMail) {
                if (checkMail.is_varified === 0) {
                    res.render('forget', { message: "Please Verify Your Mail." });
                }
                else {
                    let randomString = randomstring.generate();
                    let updateMail = await User.updateOne({ email: req.body.email }, { $set: { token: randomString } });
                    if (updateMail.acknowledged == true || updateMail.modifiedCount > 0) {
                        sendVerifyMail(checkMail.name, checkMail.email, checkMail._id, 'ResetMail', randomString);
                        res.render('forget', { message: 'Please Check Your Mail to Reset Your Password !' });
                    }
                    else {
                        res.render('forget', { message: 'Email is InValid.' });
                    }
                }
            }
            else {
                res.render('forget', { message: "Email is InValid!" });
            }
        } catch (error) {
            console.log("Error While Forget Verify Mail --> ", error);
        }
    },

    loadUserForgetPwdView: async function (req, res) {
        try {
            let findToken = await User.findOne({ token: req.query.token });
            if (findToken) {
                res.render('forget-password', { user_id: findToken._id });
            } else {
                res.render('404page', { message: 'Token is InValid!' });
            }
        } catch (error) {
            console.log("Error While Load Forget Password View --> ", error);
        }
    },

    resetPassword: async function (req, res) {
        try {

            const newPassword = await bcrypt.hash(req.body.password, 10);

            const updatePassword = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { password: newPassword, token: '' } });
            if (updatePassword) {
                res.redirect('/');
            }

        } catch (error) {
            console.log("Error While Reset Password --> ", error);
        }
    },

    reVerificationUserMailView: async function (req, res) {
        try {
            res.render('reverification');
        } catch (error) {
            console.log("Error While Re Verification Mail --> ", error);
        }
    },

    sendReVerificationMail: async function (req, res) {
        try {
            const userData = await User.findOne({ email: req.body.email });
            if (userData) {
                sendVerifyMail(userData.name, userData.email, userData._id, 'RegisterMail');
                res.render('reverification', { message: 'Reset Verification Mail Sent Your Mail Id, Please Verify Your Mail.' });
            }
            else {
                res.render('reverification', { message: "This Email is Not Exist." });
            }

        } catch (error) {
            console.log("Error While Get Send ReVerification Mail --> ", error);
        }
    },

    loadUserEditView: async function (req, res) {
        try {
            let findUserData = await User.findById({ _id: req.query.id });
            if (findUserData) {
                res.render('edit', { user: findUserData });
            }
            else {
                res.redirect('/home');
            }
        } catch (error) {
            console.log("Error While Load Edit View --> ", error);
        }
    },

    updateUserProfile: async function (req, res) {
        try {

            if (req.file) {
                try {
                    FS.unlinkSync(`./public/userImages/${req.body.oldimage}`);
                    console.log(`\n File ${req.body.oldimage} is Deleted Successfully!`);
                } catch (err) {
                    console.log("Error while Delete Old Image --> ", err);
                }
                let updateDataWithImg = {
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    image: req.file.filename
                }
                let updateProfileWithImg = await User.findByIdAndUpdate({ _id: req.query.id }, { $set: updateDataWithImg });
            }
            else {
                let updateData = {
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                }

                let updateProfile = await User.findByIdAndUpdate({ _id: req.query.id }, { $set: updateData });
            }

            await res.redirect('/home');


        } catch (error) {
            console.log("Error While Update User Profile --> ", error);
        }
    },


}

// FOR SEND MAIL FUNCTION

async function sendVerifyMail(name, email, id, type, token) {
    try {

        let transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD
            }
        });
        let mailOptions = {};
        if (type == 'RegisterMail') {
            mailOptions = {
                from: process.env.USER,
                to: email,
                subject: 'For Verification Mail',
                html: `<p> Hii User ${name} , Please Click Here to <a href="https://pavanusermanagmentsystem.onrender.com//verify?id=${id}"> Verify </a> Your Mail.</p>`
            }
        }
        else {
            mailOptions = {
                from: process.env.USER,
                to: email,
                subject: 'For Reset Password',
                html: `<p> Hii User ${name} , Please Click Here to <a href="https://pavanusermanagmentsystem.onrender.com//forget-password?token=${token}"> Reset </a> Your Password.</p>`
            }
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("Mail Send Error By User ", err);
            }
            else {
                console.log("Mail Send Info By User  --> ", info);
            }
        });
    } catch (error) {
        console.log("Error While get Send MailBy User  --> ", error);
    }
}
