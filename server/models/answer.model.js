const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    answer: {
        type: String,
        required: true,
    },
    qID: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    room: {
        type: String,
        required: true,
        default: 'test'
    }
});

module.exports = mongoose.model('answer', Schema);