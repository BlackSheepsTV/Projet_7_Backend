const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
    try {
        console.log(req.file.path)
        sharp(req.file.path)
            .resize(800, 600)
            .jpeg({ mozjpeg: true })
            .toBuffer()
            .then(data => {
                console.log('Données de l\'image compressée:', data);
                

                const outputFilePath = path.join(__dirname, '../images', req.file.filename);
                console.log(outputFilePath)
                
                fs.writeFileSync(outputFilePath, data);
            })
            .catch(err => {
                console.error('Erreur lors de la compression de l\'image:', err);
            });
     next();
    } catch(error) {
        res.status(401).json({ error });
    }
 };