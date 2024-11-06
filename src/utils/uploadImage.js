const uploadMulter = require('./mulder')
const multer = require("multer")
const path = require('path');

const uploadImageHandler = (uploadMiddleware) => {
    return async (req, res, next) => {
        try {
            await new Promise((resolve, reject) => {
                uploadMiddleware(req, res, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve();
                    }
                });
            });

            if (!req.file) {
                return res.status(400).send('No se ha subido ningún archivo o el archivo no es válido.');
            }

            const fileDetails = {
                nombreOriginal: req.file.originalname,
                nombreFile: req.file.filename,
                tipo: req.file.mimetype,
                tamaño: req.file.size,//bytes
                ruta: req.file.path,
                extensión: path.extname(req.file.originalname) // Obtiene la extensión del archivo
            };
            req.fileDetails=fileDetails
            
            next();
        } catch (error) {
            //Implementar middleware manejo de errores
            //next(error)
            return res.status(400).json({
                error: error.message
            });
        }
    };
};

module.exports = uploadImageHandler(uploadMulter.single('image'))