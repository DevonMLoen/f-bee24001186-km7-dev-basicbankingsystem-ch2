const imagekit = require("../middleware/imagekit");
const prisma = require("../db");

class Image {
    static async uploadToImageKit(file) {
        const stringFile = file.buffer.toString("base64");

        return await imagekit.upload({
            fileName: file.originalname,
            file: stringFile
        });
    }

    static async createImageRecord(file, url, fileId, userId, description) {
        return await prisma.image.create({
            data: {
                title: file.originalname,
                description: description || "",
                url: url,
                fileId: fileId,
                userId: userId
            }
        });
    }

    static async getAllImages() {
        return await prisma.image.findMany({
            include: {
                user: true,
            },
        });
    }

    static async getImageById(id) {
        return await prisma.image.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
            },
        });
    }

    static async deleteImage(id) {
        const image = await prisma.image.findUnique({
            where: { id: parseInt(id) },
        });

        if (!image) throw new Error("Image not found");

        await imagekit.deleteFile(image.fileId);
        return await prisma.image.delete({
            where: { id: parseInt(id) },
        });
    }

    static async updateImage(id, title, description) {
        return await prisma.image.update({
            where: { id: parseInt(id) },
            data: { title, description },
        });
    }
}

module.exports = Image;
