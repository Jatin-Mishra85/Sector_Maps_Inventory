// backend/controllers/image.controller.js
// Note: this handles image METADATA (path + id) only.
// If you upload files via multer (as your old system did), keep that
// upload middleware in the route file and pass the resulting file path
// into imageService.createImage() after the file is saved to disk.
const imageService = require('../services/image.service');

async function getAll(req, res) {
    try {
        const images = await imageService.getAllImages();
        res.status(200).json(images);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function getById(req, res) {
    try {
        const image = await imageService.getImageById(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found.' });
        res.status(200).json(image);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function create(req, res) {
    try {
        const image = await imageService.createImage(req.body.imagePath);
        res.status(201).json(image);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function update(req, res) {
    try {
        const image = await imageService.updateImage(req.params.id, req.body.imagePath);
        res.status(200).json(image);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function remove(req, res) {
    try {
        await imageService.deleteImage(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

module.exports = { getAll, getById, create, update, remove };