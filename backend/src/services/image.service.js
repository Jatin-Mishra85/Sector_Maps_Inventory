// backend/services/image.service.js
const imageRepository = require('../repositories/image.repository');

async function getAllImages() {
    return imageRepository.getAll();
}

async function getImageById(imageId) {
    return imageRepository.getById(imageId);
}

async function createImage(imagePath) {
    if (!imagePath || imagePath.trim() === '') {
        const error = new Error('ImagePath is required.');
        error.statusCode = 400;
        throw error;
    }
    return imageRepository.create(imagePath.trim());
}

async function updateImage(imageId, imagePath) {
    if (!imagePath || imagePath.trim() === '') {
        const error = new Error('ImagePath is required.');
        error.statusCode = 400;
        throw error;
    }
    const updated = await imageRepository.update(imageId, imagePath.trim());
    if (!updated) {
        const error = new Error('Image not found.');
        error.statusCode = 404;
        throw error;
    }
    return updated;
}

async function deleteImage(imageId) {
    const deleted = await imageRepository.remove(imageId);
    if (!deleted) {
        const error = new Error('Image not found.');
        error.statusCode = 404;
        throw error;
    }
    return true;
}

module.exports = { getAllImages, getImageById, createImage, updateImage, deleteImage };