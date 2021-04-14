const Encoding = require('./encoding')

const mockFileTypes = [
  {
    extension: '.json',
    contentType: 'application/json',
    encoding: Encoding.UTF8,
    removeFileExtension: true
  },
  {
    extension: '.xml',
    contentType: 'application/xml',
    encoding: Encoding.UTF8,
    removeFileExtension: true
  },
  {
    extension: '.jpg',
    contentType: 'image/jpeg',
    encoding: Encoding.BINARY,
    removeFileExtension: false
  },
  {
    extension: '.jpeg',
    contentType: 'image/jpeg',
    encoding: Encoding.BINARY,
    removeFileExtension: true
  },
  {
    extension: '.png',
    contentType: 'image/png',
    encoding: Encoding.BINARY,
    removeFileExtension: false
  },
  {
    extension: '.webp',
    contentType: 'image/webp',
    encoding: Encoding.BINARY,
    removeFileExtension: false
  },
]

module.exports = mockFileTypes
