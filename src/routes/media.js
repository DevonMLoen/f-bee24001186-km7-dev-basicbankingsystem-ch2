const express = require('express');
const ImageController = require('../controllers/media');
const router = express.Router();
const {imageDisk , imageBuffer} = require('../middleware/multer')
const restrict = require('../middleware/restrict');

router.use(restrict); // add jwt authenticate

router.post('/images', imageDisk.single('image'), ImageController.storageImage);

router.get('/imagekit', ImageController.getAllImages)

router.get('/imagekit/:id', ImageController.getImageById)

router.patch('/imagekit/:id', ImageController.updateImage)

router.delete('/imagekit/:id', ImageController.deleteImage)

router.post('/imagekit', imageBuffer.single('image'), ImageController.imagekitUpload);


module.exports = router;
