const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodeMailer = require('nodemailer');
const randomstring = require('randomstring');
const FS = require('fs');
const ExcelJS = require('exceljs');

// HTML TO PDF GENERATE REQUIRE THINGS 

const ejs = require('ejs');
const PDF = require('html-pdf');
const Path = require('path');

module.exports = {

    loadAdminRegisterView: async function (req, res) {
        try {
            res.render('registration');
        } catch (error) {
            console.log("Error While Get Load Admin Register--> ", error);
        }
    },

    loadAdminLoginView: async function (req, res) {
        try {
            res.render('login');
        } catch (error) {
            console.log("Error while Load Admin Login View --> ", error);
        }
    },

    addAdmin: async function (req, res) {
        try {
            const securePassword = await bcrypt.hash(req.body.password, 10);
            const admin = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                image: req.file.filename,
                password: securePassword,
                is_admin: req.body.admin,
            });
            const adminData = await admin.save();

            if (adminData) {
                sendVerifyMail(adminData.name, adminData.email, adminData._id, 'RegisterMail');
                res.render('registration', { message: 'Your Registration has been Successfully, Please Verify Your Mail.' });
            }
            else {
                res.render('registration', { message: 'Your Registration has been Failed !' });
            }
        } catch (error) {
            console.log("Error While Get Add Admin--> ", error);
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

    verifyLoginAdmin: async function (req, res) {
        try {

            const adminData = await User.findOne({ email: req.body.email });

            if (adminData) {
                const matchPassword = await bcrypt.compare(req.body.password, adminData.password);
                if (matchPassword) {
                    if (adminData.is_varified === 0) {
                        res.render('login', { message: "Please Verify Your Mail !" });
                    }
                    else {
                        if (adminData.is_admin === 0) {
                            res.render('login', { message: "Email and Password is InValid!" });
                        }
                        else {
                            req.session.admin_id = adminData._id;
                            res.redirect('/admin/home');
                        }
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
            console.log("Error While Get Verify Login Admin -->", error);
        }
    },

    loadAdminHomeView: async function (req, res) {
        try {
            let getUserData = await User.findById({ _id: req.session.admin_id }).lean();
            getUserData.createDate = new Date(getUserData.created).toLocaleDateString();
            if (getUserData) {

                res.render('home', { admin: getUserData });
            }
        } catch (error) {
            console.log("Error While Get Load Admin Home View --> ", error);
        }
    },

    loadAdminLogoutView: async function (req, res) {
        try {
            req.session.destroy();
            res.redirect('/admin');
        } catch (error) {
            console.log("Error While Load Logout View --> ", error);
        }
    },

    loadAdminForgetView: async function (req, res) {
        try {
            res.render('forget');
        } catch (error) {
            console.log("Error While Load Admin Forget View --> ", error);
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
                    if (checkMail.is_admin === 0) {
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
                    else {
                        res.render('forget', { message: 'You Are Not a Admin. !' });
                    }

                }
            }
            else {
                res.render('forget', { message: "Email is InValid!" });
            }
        } catch (error) {
            console.log("Error While Forget Admin Verify Mail --> ", error);
        }
    },

    loadAdminForgetPwdView: async function (req, res) {
        try {
            let findToken = await User.findOne({ token: req.query.token });
            if (findToken) {
                res.render('forget-password', { user_id: findToken._id });
            } else {
                res.render('404page', { message: 'Token is InValid!' });
            }
        } catch (error) {
            console.log("Error While Load Forget Admin Password View --> ", error);
        }
    },

    resetPassword: async function (req, res) {
        try {

            const newPassword = await bcrypt.hash(req.body.password, 10);

            const updatePassword = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { password: newPassword, token: '' } });
            if (updatePassword) {
                res.redirect('/admin');
            }

        } catch (error) {
            console.log("Error While Admin Reset Password --> ", error);
        }
    },

    reVerificationAdminMailView: async function (req, res) {
        try {
            res.render('reverification');
        } catch (error) {
            console.log("Error While Admin Re Verification Mail --> ", error);
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
            console.log("Error While Get Admin Send ReVerification Mail --> ", error);
        }
    },

    loadAdminEditView: async function (req, res) {
        try {
            let findUserData = await User.findById({ _id: req.query.id });
            if (findUserData) {
                res.render('edit', { user: findUserData });
            }
            else {
                res.redirect('/admin/home');
            }
        } catch (error) {
            console.log("Error While Load Admin Edit View --> ", error);
        }
    },

    updateAdminProfile: async function (req, res) {
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

            await res.redirect('/admin/home');


        } catch (error) {
            console.log("Error While Update Admin Profile --> ", error);
        }
    },

    loadAdminDashboardView: async function (req, res) {
        try {

            var search = '';
            if (req.query.search) {
                search = req.query.search;
            }

            var page = 1;
            var limit;
            if (req.query.page) {
                page = req.query.page;
            }
            if (req.query.limit) {
                limit = req.query.limit
            } 
            else {
                limit = 10;
            }


            const userData = await User.find({
                is_admin: 0,
                $or: [
                    { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { mobile: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }).limit(limit * 1).skip((page - 1) * limit);

            const userCount = await User.find({
                is_admin: 0,
                $or: [
                    { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { mobile: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }).countDocuments();



            res.render('dashboard', { users: userData, totalPages: Math.ceil(userCount / limit), currentPage: page }).exec();
        } catch (error) {
            console.log("Error While Load Admin Dashboard View --> ", error);
        }
    },

    loadAdminCreateNewUserView: async function (req, res) {
        try {
            res.render('new-user');
        } catch (error) {
            console.log("Error While Load Admin Create User View --> ", error);
        }
    },

    adminCreateNewUser: async function (req, res) {
        try {

            const password = randomstring.generate(8);

            const securePassword = await bcrypt.hash(password, 10);

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
                sendVerifyMail(req.body.name, req.body.email, userData._id, 'AdminUser', password);
                res.redirect('/admin/dashboard');
            }
            else {
                res.render('new-user', { message: 'Your Registration has been Failed !' });
            }

        } catch (error) {
            console.log("Error While Load Admin Create New User --> ", error);
        }
    },

    loadAdminUserEditView: async function (req, res) {
        try {
            const findUser = await User.findById({ _id: req.query.id });
            if (findUser) {
                res.render('edit-user', { fuser: findUser });
            } else {
                res.redirect('/admin/dashboard');
            }
            res.render('edit-user');
        } catch (error) {
            console.log("Error While Load Admin User Edit View --> ", error);
        }
    },

    adminUserUpdateProfile: async function (req, res) {
        try {

            let updateData = {
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                is_varified: req.body.verify
            }

            let updateProfile = await User.findByIdAndUpdate({ _id: req.query.id }, { $set: updateData });

            if (updateProfile) {
                await res.redirect('/admin/dashboard');
            }

        } catch (error) {
            console.log("Error While Admin User Update Profile --> ", error);
        }
    },

    adminUserDelete: async function (req, res) {
        try {
            const deleteUser = await User.deleteOne({ _id: req.query.id });
            if (deleteUser) {
                res.redirect('/admin/dashboard');
            }
        } catch (error) {
            console.log("Error While Admin User Delete --> ", error);
        }
    },

    downloadCSVFileData: async function (req, res) {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("My Users");

            worksheet.columns = [
                { header: "S no.", key: "s_no" },
                { header: "Name", key: "name" },
                { header: "Email ID", key: "email" },
                { header: "Mobile", key: "mobile" },
                { header: "Image", key: "image" },
                { header: "Is Admin", key: "is_admin" },
                { header: "Is Varified", key: "is_varified" },
            ];

            let count = 1;

            const userData = await User.find({ is_admin: 0 });

            userData.forEach((user) => {
                user.s_no = count;
                worksheet.addRow(user);
                count++;
            });

            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
            });

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
            );

            res.setHeader("Content-Disposition", `attachment; filename="users.csv"`);

            return workbook.csv.write(res).then(() => {
                res.status(200);
            });

        } catch (error) {
            console.log("Error While Download Csv File --> ", error);
        }
    },

    downloadPDFFileData: async function (req, res) {
        try {

            const userData = await User.find({ is_admin: 0 });
            const data = {
                users: userData
            }
            const filePathName = Path.resolve(__dirname, '../views/admin/htmltopdf.ejs');
            const htmlString = FS.readFileSync(filePathName).toString();
            let options = {
                format: 'A3',
                orientation: 'portrait',
                border: "10mm"
            }
            const ejsData = ejs.render(htmlString, data);
            PDF.create(ejsData, options).toFile('users.pdf', (err, responce) => {
                if (err) {
                    console.log("Error While Generate PDF ", err);
                } else {
                    const filePath = Path.resolve(__dirname, '../users.pdf');
                    FS.readFile(filePath, (err, file) => {
                        if (err) {
                            console.log("Download Pdf Error ", err);
                            return res.status(500).send('Could Not Download File');
                        }
                        else {
                            res.setHeader('Content-Type', 'application/pdf');
                            res.setHeader('Content-Disposition', `attachment; filename="users.pdf"`);
                            res.send(file);
                            console.log("PDF Downloded Successfully ", file);
                        }
                    })
                    console.log("PDF File Created ", responce);
                }
            });

        } catch (error) {
            console.log("Error While download PDF File Data --> ", error);
        }
    },

}

// FOR SEND MAIL FUNCTION

async function sendVerifyMail(name, email, id, type, password, token) {
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
                html: `<p> Hii Admin ${name} , Please Click Here to <a href="http://localhost:3000/admin/verify?id=${id}"> Verify </a> Your Mail.</p>`
            }
        }
        else if (type == 'ResetMail') {
            {
                mailOptions = {
                    from: process.env.USER,
                    to: email,
                    subject: 'For Reset Password',
                    html: `<p> Hii Admin ${name} , Please Click Here to <a href="http://localhost:3000/admin/forget-password?token=${token}"> Reset </a> Your Password.</p>`
                }
            }
        }
        else {
            {
                mailOptions = {
                    from: process.env.USER,
                    to: email,
                    subject: 'Admin Add You and Verify Your Mail',
                    html: `<p> Hii ${name} , Please Click Here to <a href="http://localhost:3000/admin/verify?id=${id}"> Verify </a> Your Mail.</p> <br> <b>Email :- </b> ${email} <br> <b>Password :- </b> ${password} <br><br> Thank You ! :)`
                }
            }
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("Mail Send Error By Admin ", err);
            }
            else {
                console.log("Mail Send Info By Admin  --> ", info);
            }
        });
    } catch (error) {
        console.log("Error While get Send Mail By Admin --> ", error);
    }
}