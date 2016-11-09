# ExpressAdvancedRouting
Advanced routing helper for express.js

## Description

Its a simple module to make it easier to get your routing files using express.js. With this, you can require recursively and pass your params.

## Installation

```
npm install express-advanced-routing --save
```

## Syntax

```javascript
routing(paths, router, params);
```

* **paths:** It can be a string or an array with target paths. Path syntaxes:
	* Without file extension: '.app/index'
	* With file extension: '.app/index.js'
	* All files in the target folder: '.app/controllers/*'
	* All files in the target folder and recursively in every subfolders: '.app/controllers/**'
* **router:** The router object used in the express app
* **params:** (Optional) : If you want to add more params to pass to your routing files. It can be usefull with other initialized handlers.

## Example:

### Project structure

- [project root]/
	- controllers/
		- services/
			- private/
				- security.js
			- rest.js
			- export.js
		- domain/
			- users/
				- list.js
				- show.js
				- edit.js
			- books/
				- read.js
			- base.js
		- main.js
	- index.js



### Code

**./index.js**

```javascript
'use strict';

var express = require('express'),
	routing = require('express-advanced-routing');

var app = express(),
	router = express.Router();

// require the main.js file under the controllers map and
// all js files under the controllers/domain, recursively
routing([ './app/controllers/main', './app/controllers/domain/**' ], router);

// It also require all files beneath the service folder and
// passing params object with one attribute: targetUrl
routing('./app/controllers/services/*', router, { targetUrl: '/endpoints'});

app.use('/', router);

app.listen(3000, () => {
	console.log('Server listening on port 3000');
});
```

**./app/controllers/main.js**

```javascript
'use strict';

module.exports = (router) => {
	router.get('/', (req, res) => {
		res.render('main/index');
	});
};
```

**./app/controllers/services/export.js**

```javascript
'use strict';

module.exports = (router, params) => {
	console.log(params.targetUrl); // => '/endpoints'

	router.get(params.targetUrl, (req, res) => {
		res.render('services/export');
	});
};
```
etc...

### Included list:

- ./app/controllers/main.js
- ./app/controllers/domain/base.js
- ./app/controllers/domain/users/list.js
- ./app/controllers/domain/users/show.js
- ./app/controllers/domain/users/edit.js
- ./app/controllers/domain/books/read.js
- ./app/controllers/services/rest.js
- ./app/controllers/services/export.js

## Future plans:

- Excluding paths or single files
- Minor improvements and small feature implementations
