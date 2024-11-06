const multer = require("multer")
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //Definir ruta
        const uploadPath = 'uploads/';

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no soportado. Solo se permiten imágenes (jpeg, png).'), false);
    }
};

module.exports= multer({
    storage: storage,
    limits: {
        //Definir megabyte
        
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: fileFilter
});