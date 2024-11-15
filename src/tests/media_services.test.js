require('dotenv').config();

const Image = require('../services/media');
const imagekit = require('../middleware/imagekit');
const prisma = require('../db');
const { HttpError } = require('../middleware/errorhandling');

jest.mock('../middleware/imagekit', () => ({
    upload: jest.fn(),
    deleteFile: jest.fn(),
}));

jest.mock('../db', () => ({
    image: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
    },
}));

describe('Image Service', () => {
    const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'testImage.jpg'
    };
    const userId = 'userId';
    const description = 'Test image description';

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadToImageKit', () => {
        it('should upload the file to ImageKit and return the response', async () => {
            const uploadResponse = { url: 'http://imagekit.io/testImage.jpg', fileId: 'fileId' };
            imagekit.upload.mockResolvedValue(uploadResponse);

            const result = await Image.uploadToImageKit(mockFile);
            expect(imagekit.upload).toHaveBeenCalledWith({
                fileName: mockFile.originalname,
                file: mockFile.buffer.toString("base64")
            });
            expect(result).toEqual(uploadResponse);
        });

        it('should handle upload failure', async () => {
            imagekit.upload.mockRejectedValue(new Error('Upload failed'));

            await expect(Image.uploadToImageKit(mockFile)).rejects.toThrow('Upload failed');
        });

        it('should throw HttpError on failure', async () => {
            imagekit.upload.mockRejectedValue(new Error('Upload failed'));

            await expect(Image.uploadToImageKit(mockFile)).rejects.toThrow(HttpError);
        });
    });

    describe('createImageRecord', () => {
        it('should create an image record in the database', async () => {
            const uploadResponse = { url: 'http://imagekit.io/testImage.jpg', fileId: 'fileId' };
            const newImage = { id: 'newImageId' };

            prisma.image.create.mockResolvedValue(newImage);

            const result = await Image.createImageRecord(mockFile, uploadResponse.url, uploadResponse.fileId, userId, description);
            expect(prisma.image.create).toHaveBeenCalledWith({
                data: {
                    title: mockFile.originalname,
                    description: description || "",
                    url: uploadResponse.url,
                    fileId: uploadResponse.fileId,
                    userId: userId
                }
            });
            expect(result).toEqual(newImage);
        });

        it('should handle database creation failure', async () => {
            const uploadResponse = { url: 'http://imagekit.io/testImage.jpg', fileId: 'fileId' };
            prisma.image.create.mockRejectedValue(new Error('Database error'));

            await expect(Image.createImageRecord(mockFile, uploadResponse.url, uploadResponse.fileId, userId, description)).rejects.toThrow('Database error');
        });

        it('should handle case when description is undefined', async () => {
            const uploadResponse = { url: 'http://imagekit.io/testImage.jpg', fileId: 'fileId' };
            const newImage = { id: 'newImageId' };

            prisma.image.create.mockResolvedValue(newImage);

            const result = await Image.createImageRecord(mockFile, uploadResponse.url, uploadResponse.fileId, userId);
            expect(prisma.image.create).toHaveBeenCalledWith({
                data: {
                    title: mockFile.originalname,
                    description: "",
                    url: uploadResponse.url,
                    fileId: uploadResponse.fileId,
                    userId: userId
                }
            });
            expect(result).toEqual(newImage);
        });

        it('should throw HttpError on database failure', async () => {
            const uploadResponse = { url: 'http://imagekit.io/testImage.jpg', fileId: 'fileId' };
            prisma.image.create.mockRejectedValue(new Error('Database error'));

            await expect(Image.createImageRecord(mockFile, uploadResponse.url, uploadResponse.fileId, userId, description)).rejects.toThrow(HttpError);
        });
    });

    describe('getAllImages', () => {
        it('should return all images from the database', async () => {
            const images = [{ id: 1, title: 'Image 1' }, { id: 2, title: 'Image 2' }];
            prisma.image.findMany.mockResolvedValue(images);

            const result = await Image.getAllImages();
            expect(prisma.image.findMany).toHaveBeenCalledWith({
                include: { user: true },
            });
            expect(result).toEqual(images);
        });

        it('should throw HttpError if no images found', async () => {
            prisma.image.findMany.mockResolvedValue(null);

            await expect(Image.getAllImages()).rejects.toThrow(HttpError);
        });

        it('should throw HttpError on database failure', async () => {
            prisma.image.findMany.mockRejectedValue(new Error('Database error'));

            await expect(Image.getAllImages()).rejects.toThrow(HttpError);
        });
    });

    describe('getImageById', () => {
        it('should return the image by id', async () => {
            const image = { id: 1, title: 'Image 1' };
            prisma.image.findUnique.mockResolvedValue(image);

            const result = await Image.getImageById(1);
            expect(prisma.image.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { user: true },
            });
            expect(result).toEqual(image);
        });

        it('should return null if the image does not exist', async () => {
            prisma.image.findUnique.mockResolvedValue(null);

            const result = await Image.getImageById(1);
            expect(result).toBeNull();
        });

        it('should throw HttpError if image not found', async () => {
            prisma.image.findUnique.mockResolvedValue(null);

            await expect(Image.getImageById(1)).rejects.toThrow(HttpError);
        });

        it('should throw HttpError on database failure', async () => {
            prisma.image.findUnique.mockRejectedValue(new Error('Database error'));

            await expect(Image.getImageById(1)).rejects.toThrow(HttpError);
        });
    });

    describe('deleteImage', () => {
        it('should delete the image and return it', async () => {
            const image = { id: 1, fileId: 'fileId' };
            prisma.image.findUnique.mockResolvedValue(image);
            prisma.image.delete.mockResolvedValue(image);

            await Image.deleteImage(1);
            expect(prisma.image.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(imagekit.deleteFile).toHaveBeenCalledWith(image.fileId);
            expect(prisma.image.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        it('should handle delete failure', async () => {
            const image = { id: 1, fileId: 'fileId' };
            prisma.image.findUnique.mockResolvedValue(image);
            prisma.image.delete.mockRejectedValue(new Error('Delete failed'));

            await expect(Image.deleteImage(1)).rejects.toThrow('Delete failed');
        });

        it('should throw HttpError if the image is not found', async () => {
            prisma.image.findUnique.mockResolvedValue(null);

            await expect(Image.deleteImage(1)).rejects.toThrow(HttpError);
        });

        it('should throw HttpError if delete fails', async () => {
            const image = { id: 1, fileId: 'fileId' };
            prisma.image.findUnique.mockResolvedValue(image);
            imagekit.deleteFile.mockRejectedValue(new Error('Delete error'));

            await expect(Image.deleteImage(1)).rejects.toThrow(HttpError);
        });
    });

    describe('updateImage', () => {
        it('should update the image title and description', async () => {
            const updatedImage = { id: 1, title: 'Updated Title', description: 'Updated Description' };
            prisma.image.update.mockResolvedValue(updatedImage);

            const result = await Image.updateImage(1, 'Updated Title', 'Updated Description');
            expect(prisma.image.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { title: 'Updated Title', description: 'Updated Description' },
            });
            expect(result).toEqual(updatedImage);
        });

        it('should handle update failure', async () => {
            prisma.image.update.mockRejectedValue(new Error("Update error"));

            await expect(Image.updateImage(1, 'Updated Title', 'Updated Description')).rejects.toThrow(HttpError);
        });

        it('should throw HttpError if image not found on update', async () => {
            prisma.image.update.mockResolvedValue(null);

            await expect(Image.updateImage(1, 'Updated Title', 'Updated Description')).rejects.toThrow(HttpError);
        });
    });
});
