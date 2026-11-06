const { ImageKit } = require('@imagekit/nodejs');

const imageKitClient = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function uploadFile(file, originalName = 'audio') {
  return imageKitClient.files.upload({
    file,
    fileName: `music_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
    folder: 'melody/music'
  });
}

module.exports = { uploadFile };
