import { Encoding } from './utilities/encoding.js'

export const mockFileTypes = [
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
    extension: '.html',
    contentType: 'text/html',
    encoding: Encoding.UTF8,
    removeFileExtension: true
  },
  {
    extension: '.css',
    contentType: 'text/css',
    encoding: Encoding.UTF8,
    removeFileExtension: false
  },
  {
    extension: '.jpg',
    contentType: 'image/jpeg',
    encoding: Encoding.BINARY,
    removeFileExtension: true
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
    removeFileExtension: true
  },
  {
    extension: '.webp',
    contentType: 'image/webp',
    encoding: Encoding.BINARY,
    removeFileExtension: true
  },
  {
    extension: '.avif',
    contentType: 'image/avif',
    encoding: Encoding.BINARY,
    removeFileExtension: true
  },
  {
    extension: '.mjs',
    contentType: 'application/json',
    encoding: Encoding.UTF8,
    removeFileExtension: true
  },
  {
    extension: '.js',
    contentType: 'text/javascript',
    encoding: Encoding.UTF8,
    removeFileExtension: false
  },
]
