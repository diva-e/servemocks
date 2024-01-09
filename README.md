# servemocks

| [Contributing](/CONTRIBUTING.md) | [Changelog](/CHANGELOG.md) | [Powered by diva-e](https://www.diva-e.com) |
|----------------------------------|----------------------------|---------------------------------------------|

[![GitHub stars](https://img.shields.io/github/stars/diva-e/servemocks.svg?style=social&label=Star)](https://github.com/diva-e/servemocks)

Starts a webserver which provides a REST API derived from JSON, XML and other sample files located in a specified directory.

Consider the following directory structure:

```plantuml
mock-api/
├── image
│   └── logo.png
├── v1
│   ├── user
│   │   ├── 1.json
│   │   ├── 2.json
|   |   └── [any].json
│   ├── user.json
│   └── user.post.json
└── v2
    ├── health.json
    └── sitemap.xml
```

Serving directory `mock-api` with servemocks would create a webserver with the folllowing http endpoints:

* **GET**   /image/logo.png
* **GET**   /v1/user
* **POST**  /v1/user
* **GET**   /v1/user/1
* **GET**   /v1/user/2
* **GET**   /v2/health
* **GET**   /v2/sitemap

Check the [examples](https://github.com/diva-e/servemocks/tree/main/examples) directory for more information about api conventions.

Starting from version 2 it is also possible to produce dynamic mock responses by using an ecmascript module
as mock file. Use the file extension `.mjs` to enable this function.
Example: [examples/v3](https://github.com/diva-e/servemocks/tree/main/examples/mock-api/v3).

## Getting Started

### Install

```bash
# install as global package
npm install -g servemocks
# or project-local
npm add -D servemocks
```

### Usage

```plain
servemocks <directory> [-p, --port=8080] [-c, --compact-logging]
```

Example:

```bash
servemocks examples/mock-api -p 5000
```

## Programmatic Usage

Servemocks is based on express and can be mounted as a submodule inside an existing app.

```js
import { createServeMocksExpressApp } from 'servemocks';

const mainApp = express();

const options = {
  responseDelay_ms: 100,
  // servemocks prints every endpoint it registers to the console
  //  this might bloat the console log and thus you can change this setting here
  endpointRegistrationLogging: 'compact', // default is 'verbose', use 'disabled' to not show any of those logs
  // enable javascript code to be executed from a mock file with 
  //  .mjs file extension
  //  eval can be used as alternative strategy if dynamicImport does not work
  dynamicMockResponsesMode: 'eval' // one of 'disabled', 'eval' and 'dynamicImport'
}

mainApp.use('/mock-api', createServeMocksExpressApp('examples/mock-api', options))
```

## License

[MIT](LICENSE)
