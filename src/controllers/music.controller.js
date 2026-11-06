const musicModel = require('../models/music.model');
const albumModel = require('../models/album.model');
const userModel = require('../models/user.model');
const { uploadFile } = require('../services/storage.service');

async function createMusic(req, res) {
  try {
    const title = req.body.title?.trim();
    const file = req.file;
    if (!title) return res.status(400).json({ message: 'Song title is required.' });
    if (!file) return res.status(400).json({ message: 'Please select an audio file.' });
    if (!file.mimetype.startsWith('audio/')) {
      return res.status(400).json({ message: 'Only audio files are allowed.' });
    }
    const result = await uploadFile(file.buffer.toString('base64'), file.originalname);
    const music = await musicModel.create({ uri: result.url, title, artist: req.user.id });
    return res.status(201).json({ message: 'Music created successfully', music });
  } catch (error) {
    console.error('Music upload error:', error);
    return res.status(500).json({ message: 'Unable to upload music.' });
  }
}

async function createAlbum(req, res) {
  try {
    const title = req.body.title?.trim();
    const musics = Array.isArray(req.body.musics) ? req.body.musics : [];
    if (!title) return res.status(400).json({ message: 'Album title is required.' });
    if (!musics.length) return res.status(400).json({ message: 'Select at least one song.' });
    const ownedSongs = await musicModel.find({ _id: { $in: musics }, artist: req.user.id }).select('_id');
    if (ownedSongs.length !== new Set(musics.map(String)).size) {
      return res.status(400).json({ message: 'Select only your uploaded songs.' });
    }
    const album = await albumModel.create({ title, artist: req.user.id, musics });
    return res.status(201).json({ message: 'Album created successfully', album });
  } catch (error) {
    console.error('Album creation error:', error);
    return res.status(500).json({ message: 'Unable to create album.' });
  }
}

async function getAllMusics(req, res) {
  const musics = await musicModel.find().populate('artist', 'username email').sort({ _id: -1 });
  res.json({ musics });
}

async function getArtistMusics(req, res) {
  const musics = await musicModel.find({ artist: req.user.id }).sort({ _id: -1 });
  res.json({ musics });
}

async function getAllAlbums(req, res) {
  const albums = await albumModel.find().select('title artist musics')
    .populate('artist', 'username email').populate('musics').sort({ _id: -1 });
  res.json({ albums });
}

async function getArtistAlbums(req, res) {
  const albums = await albumModel.find({ artist: req.user.id }).populate('musics').sort({ _id: -1 });
  res.json({ albums });
}

async function getAlbumById(req, res) {
  const album = await albumModel.findById(req.params.albumId)
    .populate('artist', 'username email').populate('musics');
  if (!album) return res.status(404).json({ message: 'Album not found.' });
  res.json({ album });
}

async function toggleLike(req, res) {
  const { songId } = req.params;
  const song = await musicModel.findById(songId);
  if (!song) return res.status(404).json({ message: 'Song not found.' });
  const user = await userModel.findById(req.user.id);
  const alreadyLiked = user.likedSongs.some(id => id.toString() === songId);
  if (alreadyLiked) user.likedSongs.pull(songId);
  else user.likedSongs.push(songId);
  await user.save();
  res.json({ liked: !alreadyLiked, likedSongs: user.likedSongs });
}

async function getLikedSongs(req, res) {
  const user = await userModel.findById(req.user.id).populate({
    path: 'likedSongs', populate: { path: 'artist', select: 'username' }
  });
  res.json({ musics: user?.likedSongs || [] });
}

module.exports = {
  createMusic, createAlbum, getAllAlbums, getAllMusics, getAlbumById,
  getArtistMusics, getArtistAlbums, toggleLike, getLikedSongs
};
