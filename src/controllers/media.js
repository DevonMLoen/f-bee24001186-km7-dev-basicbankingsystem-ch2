const Image = require("../services/media");

class ImageController {
    static async storageImage(req, res) {
        const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

        return res.status(200).json({
            status: true,
            message: 'success',
            data: {
                image_url: imageUrl
            }
        });
    }

    static async imagekitUpload(req, res) {
        try {
            const uploadFile = await Image.uploadToImageKit(req.file);
            const newImage = await Image.createImageRecord(req.file, uploadFile.url, uploadFile.fileId, req.user.id, req.body.description);

            return res.json({
                status: true,
                message: 'success',
                data: {
                    id: newImage.id,
                    name: uploadFile.name,
                    url: uploadFile.url,
                    type: uploadFile.type
                }
            });
        } catch (err) {
            return res.status(500).json({ status: false, message: 'Internal server error' });
        }
    }

    static async getAllImages(req, res) {
        try {
            const images = await Image.getAllImages();

            return res.json({
                status: true,
                message: 'success',
                data: images,
            });
        } catch (err) {
            return res.status(500).json({ status: false, message: 'Internal server error' });
        }
    }

    static async getImageById(req, res) {
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
        } catch (err) {
            return res.status(500).json({ status: false, message: 'Internal server error' });
        }
    }

    static async deleteImage(req, res) {
        try {
            await Image.deleteImage(req.params.id);
            return res.json({
                status: true,
                message: 'Image deleted successfully',
            });
        } catch (err) {
            if (err.code === 'P2025') {
                return res.status(404).json({ status: false, message: 'Image not found' });
            }
            return res.status(500).json({ status: false, message: err.message || 'Internal server error' });
        }
    }

    static async updateImage(req, res) {
        try {
            const updatedImage = await Image.updateImage(req.params.id, req.body.title, req.body.description);

            return res.json({
                status: true,
                message: 'Image updated successfully',
                data: updatedImage,
            });
        } catch (err) {
            if (err.code === 'P2025') {
                return res.status(404).json({ status: false, message: 'Image not found' });
            }
            return res.status(500).json({ status: false, message: 'Internal server error' });
        }
    }
}

module.exports = ImageController;
