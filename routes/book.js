const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');
const sharp = require('../middleware/sharp');

const router = express.Router();

router.post('/', auth, multer, sharp,  bookCtrl.createBook);

router.get('/', bookCtrl.getAllBook);
router.get('/bestrating', bookCtrl.getBestRatingBook);
router.get('/:id', bookCtrl.getOneBook);
router.post('/:id/rating', auth, bookCtrl.addRatingBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);

router.delete('/:id',auth, bookCtrl.deleteBook);

module.exports = router;