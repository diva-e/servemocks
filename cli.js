#!/usr/bin/env node

const program = require('commander')
const serveMocks = require('./src/serve-mocks')

const hostname = process.env.SERVEMOCKS_HOST || '127.0.0.1'

program
  .version('1.1.0')
  .arguments('<mock-directory>')
  .option( '-p, --port <port>', 'Change webserver port')
  .action( function(mockDirectory, env) {
    serveMocks(mockDirectory, env.port || 8080, hostname)
  })
  .parse(process.argv)
