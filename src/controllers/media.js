const Image = require("../services/media");

class ImageController {
    static async storageImage(req, res, next) {
        try {

            const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

            return res.status(200).json({
                status: true,
                message: 'success',
                data: {
                    image_url: imageUrl
                }
            });
        } catch (error) {
            next(error);
        }

    }

    static async imagekitUpload(req, res, next) {
        try {
            const uploadFile = await Image.uploadToImageKit(req.file);
            const newImage = await Image.createImageRecord(req.file, uploadFile.url, uploadFile.fileId, req.user.id, req.body.description);

            return res.status(200).json({
                status: true,
                message: 'success',
                data: {
                    id: newImage.id,
                    name: uploadFile.name,
                    url: uploadFile.url,
                    type: uploadFile.type
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllImages(req, res, next) {
        try {
            const images = await Image.getAllImages();

            return res.status(200).json({
                status: true,
                message: 'success',
                data: images,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getImageById(req, res, next) {
        try {
            const image = await Image.getImageById(req.params.id);

            if (!image) {
                return res.status(404).json({ status: false, message: 'Image not found' });
            }

            return res.json({
                status: true,
                message: 'success',
                data: image,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteImage(req, res, next) {
        try {
            await Image.deleteImage(req.params.id);
            return res.status(200).json({
                status: true,
                message: 'Image deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateImage(req, res, next) {
        try {
            const updatedImage = await Image.updateImage(req.params.id, req.body.title, req.body.description);

            return res.status(200).json({
                status: true,
                message: 'Image updated successfully',
                data: updatedImage,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ImageController;
