const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getNotes,
    createNote,
    updateNote,
    togglePin,
    deleteNote
} = require('../controllers/noteController');

router.get('/', auth, getNotes);
router.post('/', auth, createNote);
router.put('/:id', auth, updateNote);
router.patch('/:id/pin', auth, togglePin);
router.delete('/:id', auth, deleteNote);

module.exports = router;
