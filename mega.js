const mega = require('megajs');

const credentials = {
  email: 'wohabo1681@calorpg.com',
  password: 'Chamindu2008',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
};

const upload = (stream, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const storage = new mega.Storage(credentials, () => {
        const file = storage.upload({ name: filename, allowUploadBuffering: true });
        stream.pipe(file);

        storage.on('add', file => {
          file.link((err, url) => {
            if (err) return reject(err);
            storage.close();
            resolve(url);
          });
        });
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { upload };