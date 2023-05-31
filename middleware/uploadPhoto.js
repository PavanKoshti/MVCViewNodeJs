const multer = require('multer');
const path = require('path');

//MULLTER MIDDLEWARE 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '_' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({
    storage: storage
}).single("image");

module.exports = upload;