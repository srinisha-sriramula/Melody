const express = require('express');
const multer = require('multer');
const musicController = require('../controllers/music.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

router.post('/upload', auth.authArtist, upload.single('music'), musicController.createMusic);
router.post('/album', auth.authArtist, musicController.createAlbum);
router.get('/', auth.authUser, musicController.getAllMusics);
router.get('/albums', auth.authUser, musicController.getAllAlbums);
router.get('/my-songs', auth.authArtist, musicController.getArtistMusics);
router.get('/my-albums', auth.authArtist, musicController.getArtistAlbums);
router.get('/liked', auth.authUser, musicController.getLikedSongs);
router.post('/:songId/like', auth.authUser, musicController.toggleLike);
router.get('/album/:albumId', auth.authUser, musicController.getAlbumById);

module.exports = router;
