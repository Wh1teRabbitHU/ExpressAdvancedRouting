'use strict';

const EXTENSION = '.js';

var walk    = require('walk'),
	path    = require('path'),
	fs      = require('fs');

function getRelativePath(root, filename) {
	return path.relative(__dirname, root + '/' + path.basename(filename, EXTENSION)).replace(/\\/g, '/');
}

function walkInSubfolders(p, elements) {
	walk.walkSync(p, {
		followLinks: false,
		listeners: {
			file: (root, fileStat, next) => {
				var relPath = getRelativePath(root, fileStat.name);

				elements[relPath] = require(relPath); // eslint-disable-line global-require
				next();
			}
		}
	});
}

function walkThisFolder(p, elements) {
	fs.readdirSync(p).forEach((file) => {
		if (!fs.lstatSync(p + file).isDirectory()) {
			var relPath = getRelativePath(p, file);

			elements[relPath] = require(relPath); // eslint-disable-line global-require
		}
	});
}

function readFiles(paths) {
	var pathArray = [],
		elements = {};

	var relPath;

	if (Array.isArray(paths)) {
		pathArray = paths;
	} else {
		pathArray.push(paths);
	}

	pathArray.forEach((p) => {
		if (p.endsWith('**')) {
			p = p.substr(0, p.length - 2);

			walkInSubfolders(p, elements);
		} else if (p.endsWith('*')) {
			p = p.substr(0, p.length - 1);

			walkThisFolder(p, elements);
		} else if (path.extname(p) === '') {
			relPath = getRelativePath(path.dirname(p), p);

			elements[relPath] = require(relPath); // eslint-disable-line global-require
		} else {
			relPath = getRelativePath(path.dirname(p), path.basename(p));

			elements[relPath] = require(relPath); // eslint-disable-line global-require
		}
	});

	return elements;
}

function processElements(routeElements, router, params) {
	Object.keys(routeElements).forEach((key) => {
		if (params.logger) {
			params.logger.info('Loading routing file: ' + key);
		} else {
			console.log('Loading routing file: ' + key);
		}

		routeElements[key](router, params);
	});

	return router;
}

module.exports = {
	loadRoutes: function(paths, router, params) {
		params = params || {};

		return processElements(readFiles(paths), router, params);
	}
};