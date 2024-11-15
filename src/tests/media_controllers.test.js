const ImageKit = require("imagekit");
jest.mock("imagekit");

const ImageController = require("../controllers/media");
const Image = require("../services/media");

ImageKit.mockImplementation(() => ({
    upload: jest.fn().mockResolvedValue({
        url: 'http://imagekit.io/test.jpg',
        fileId: 'file123',
        name: 'test.jpg',
        type: 'image'
    }),
    deleteFile: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/media');

describe("ImageController", () => {
    let req, res;

    beforeEach(() => {
        req = {
            protocol: 'http',
            get: jest.fn().mockReturnValue('localhost:3000'),
            file: { filename: 'test.jpg' },
            params: { id: '1' },
            user: { id: 'user1' },
            body: { title: 'title', description: 'description' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("storageImage", () => {
        it("should return image URL", async () => {
            await ImageController.storageImage(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: 'success',
                data: {
                    image_url: 'http://localhost:3000/images/test.jpg'
                }
            });
        });

        it("should handle missing file in request", async () => {
            req.file = undefined; // Simulate missing file
            await ImageController.storageImage(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'File is required'
            });
        });
    });

    describe("imagekitUpload", () => {
        it("should upload image to ImageKit and create record", async () => {
            const mockUploadResponse = {
                url: 'http://imagekit.io/test.jpg',
                fileId: 'file123',
                name: 'test.jpg',
                type: 'image'
            };
            const mockImageRecord = { id: 'img1', ...mockUploadResponse };

            Image.uploadToImageKit.mockResolvedValue(mockUploadResponse);
            Image.createImageRecord.mockResolvedValue(mockImageRecord);

            await ImageController.imagekitUpload(req, res);

            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: 'success',
                data: {
                    id: mockImageRecord.id,
                    name: mockUploadResponse.name,
                    url: mockUploadResponse.url,
                    type: mockUploadResponse.type
                }
            });
        });

        it("should handle errors and return 500", async () => {
            Image.uploadToImageKit.mockRejectedValue(new Error("Upload error"));

            await ImageController.imagekitUpload(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Internal server error'
            });
        });

        it("should handle missing file in request", async () => {
            req.file = undefined; // Simulate missing file
            await ImageController.imagekitUpload(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'File is required'
            });
        });
    });

    describe("getAllImages", () => {
        it("should return all images", async () => {
            const mockImages = [{ id: 'img1', url: 'http://imagekit.io/test.jpg' }];
            Image.getAllImages.mockResolvedValue(mockImages);

            await ImageController.getAllImages(req, res);

            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: 'success',
                data: mockImages,
            });
        });

        it("should handle errors and return 500", async () => {
            Image.getAllImages.mockRejectedValue(new Error("Fetch error"));

            await ImageController.getAllImages(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Internal server error'
            });
        });
    });

    describe("getImageById", () => {
        it("should return an image by ID", async () => {
            const mockImage = { id: 'img1', url: 'http://imagekit.io/test.jpg' };
            Image.getImageById.mockResolvedValue(mockImage);

            await ImageController.getImageById(req, res);

            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: 'success',
                data: mockImage,
            });
        });

        it("should return 404 if image is not found", async () => {
            Image.getImageById.mockResolvedValue(null);

            await ImageController.getImageById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Image not found'
            });
        });

        it("should handle invalid image ID and return 500", async () => {
            req.params.id = 'invalid'; // Simulate invalid ID
            Image.getImageById.mockRejectedValue(new Error("Invalid ID"));

            await ImageController.getImageById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Internal server error'
            });
        });
    });

    describe("deleteImage", () => {
        it("should delete an image by ID", async () => {
            Image.deleteImage.mockResolvedValue();

            await ImageController.deleteImage(req, res);

            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: 'Image deleted successfully'
            });
        });

        it("should return 404 if image is not found", async () => {
            const error = new Error("Image not found");
            error.code = 'P2025';
            Image.deleteImage.mockRejectedValue(error);

            await ImageController.deleteImage(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Image not found'
            });
        });

        it("should handle unexpected errors and return 500", async () => {
            const unexpectedError = new Error();
            Image.deleteImage.mockRejectedValue(unexpectedError);

            await ImageController.deleteImage(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Internal server error'
            });
        });
    });

    describe("updateImage", () => {
        it("should update an image by ID", async () => {
            const mockUpdatedImage = { id: 'img1', title: 'New title', description: 'Updated description' };
            Image.updateImage.mockResolvedValue(mockUpdatedImage);

            await ImageController.updateImage(req, res);

            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: 'Image updated successfully',
                data: mockUpdatedImage,
            });
        });

        it("should return 404 if image is not found", async () => {
            const error = new Error("Image not found");
            error.code = 'P2025';
            Image.updateImage.mockRejectedValue(error);

            await ImageController.updateImage(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Image not found'
            });
        });

        it("should handle other errors and return 500", async () => {
            Image.updateImage.mockRejectedValue(new Error("Update error"));

            await ImageController.updateImage(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Internal server error'
            });
        });
    });
});
