import { memoryStorage } from 'multer';

export const uploadImageOptions = {
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type, only JPEG and PNG is allowed! your minetype is ${file.mimetype}`), false);
    }
  },
};

export const uploadAudioOptions = {
  fileFilter: (req, file, cb) => {
    const mimetypes = [
      'audio/mpeg',
      'audio/wave',
      'audio/wav',
      'audio/mp4',
      'audio/vnd.wav',
      'audio/mp3',
      'audio/vnd.wave',
    ];

    if (mimetypes.indexOf(file.mimetype) === -1) {
      cb(new Error(`Invalid file type, only MP3, MP4 and WAV is allowed! your minetype is ${file.mimetype}`), false);
    } else {
      cb(null, true);
    }
  },
  storage: memoryStorage(),
  limits: {
    fileSize: 2097152000
  },
};
