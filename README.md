# servemocks

Starts a webserver which provides a REST API derived from JSON, XML and other sample files located in a specified directory.

Consider the following directory structure:

```plantuml
mock-api/
├── image
│   └── logo.png
├── v1
│   ├── user
│   │   ├── 1.json
│   │   └── 2.json
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

## Quick Links

[Contributing](/CONTRIBUTING.md) | [Powered by diva-e](https://www.diva-e.com)
| --- | --- |

## Getting Started

### Install

```bash
# install as global package
npm install -g servemocks
# or project-local
npm install --save-dev servemocks
```

### Usage

```plain
servemocks <directory> [-p, --port=8080]
```

Example:

```bash
servemocks examples/mock-api -p 5000
```

## License

[MIT](LICENSE)
