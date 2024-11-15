const imagekit = require("../middleware/imagekit");
const prisma = require("../db");
const { HttpError } = require("../middleware/errorhandling");

class Image {
    static async uploadToImageKit(file) {
        try {
            const stringFile = file.buffer.toString("base64");

            return await imagekit.upload({
                fileName: file.originalname,
                file: stringFile
            });
        } catch (error) {
            throw new HttpError('Failed to upload image to ImageKit: ' + error.message, error.statusCode);
        }
    }

    static async createImageRecord(file, url, fileId, userId, description) {
        try {
            return await prisma.image.create({
                data: {
                    title: file.originalname,
                    description: description || "",
                    url: url,
                    fileId: fileId,
                    userId: userId
                }
            });
        } catch (error) {
            throw new HttpError('Failed to create image record: ' + error.message, error.statusCode);
        }
    }

    static async getAllImages() {
        try {
            const images = await prisma.image.findMany({
                include: {
                    user: true,
                },
            });

            if (!images) {
                throw new HttpError("Images not found", 404);
            }

            return images;


        } catch (error) {
            throw new HttpError('Failed to retrieve images: ' + error.message, error.statusCode);
        }
    }

    static async getImageById(id) {
        try {
            const image = await prisma.image.findUnique({
                where: { id: parseInt(id) },
                include: {
                    user: true,
                },
            });

            if (!image) {
                throw new HttpError("Image not found", 404);
            }

            return image;
        } catch (error) {
            throw new HttpError('Failed to retrieve image: ' + error.message, error.statusCode);
        }
    }

    static async deleteImage(id) {
        try {
            const image = await prisma.image.findUnique({
                where: { id: parseInt(id) },
            });

            if (!image) {
                throw new HttpError("Image not found", 404);
            }

            await imagekit.deleteFile(image.fileId);
            return await prisma.image.delete({
                where: { id: parseInt(id) },
            });
        } catch (error) {
            throw new HttpError('Failed to delete image: ' + error.message, error.statusCode);
        }
    }

    static async updateImage(id, title, description) {
        try {
            const image = await prisma.image.update({
                where: { id: parseInt(id) },
                data: { title, description },
            });

            if (!image) {
                throw new HttpError("Image not found", 404);
            }

            return image;
        } catch (error) {
            throw new HttpError('Failed to update image: ' + error.message, error.statusCode);
        }
    }
}

module.exports = Image;
