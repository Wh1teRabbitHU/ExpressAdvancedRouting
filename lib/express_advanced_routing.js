'use strict';

const EXTENSION = '.js';

var walk    = require('walk'),
	path    = require('path'),
	fs      = require('fs');

/**
 * Get relative path for function require
 *
 * @param  {String} root     Root path to the file
 * @param  {String} filename Filename
 * @return {String}          Relative path
 */
function getRelativePath(root, filename) {
	return path.relative(__dirname, root + '/' + path.basename(filename, EXTENSION)).replace(/\\/g, '/');
}

/**
 * Recursively walking throught the target folder's and the subfolder's files
 *
 * @param  {String} p        Root folder
 * @param  {Object} elements Required function's object
 * @return {undefined}
 */
function walkInSubfolders(p, elements) {
	walk.walkSync(p, {
		followLinks: false,
		listeners: {
			file: (root, fileStat, next) => {
				var relPath = getRelativePath(root, fileStat.name);

				if (typeof elements[relPath] == 'undefined') {
					elements[relPath] = require(relPath); // eslint-disable-line global-require
				}
				next();
			}
		}
	});
}

/**
 * Walking throught only the given folder's files
 *
 * @param  {String} p        Root folder
 * @param  {Object} elements Required function's object
 * @return {undefined}
 */
function walkThisFolder(p, elements) {
	fs.readdirSync(p).forEach((file) => {
		if (!fs.lstatSync(p + file).isDirectory()) {
			var relPath = getRelativePath(p, file);

			if (typeof elements[relPath] == 'undefined') {
				elements[relPath] = require(relPath); // eslint-disable-line global-require
			}
		}
	});
}

/**
 * Read target files
 *
 * @param  {Array || String} paths Target file's paths
 * @return {Object}				   Required function's object
 */
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

			if (typeof elements[relPath] == 'undefined') {
				elements[relPath] = require(relPath); // eslint-disable-line global-require
			}
		} else {
			relPath = getRelativePath(path.dirname(p), path.basename(p));

			if (typeof elements[relPath] == 'undefined') {
				elements[relPath] = require(relPath); // eslint-disable-line global-require
			}
		}
	});

	return elements;
}

/**
 * Processing routing elements (private)
 *
 * @param  {Function} 		 routeElements	Required routing functions
 * @param  {Express router}  router 		The router object used in the app
 * @param  {Object}		 	 params 		Extra params, it passed to the routing files, too
 * @return {Express router}         		The router object after register routing functions
 */
function processElements(routeElements, router, params) {
	Object.keys(routeElements).forEach((key) => {
		if (typeof params.logger != 'undefined') {
			params.logger.info('Loading routing file: ' + key);
		} else {
			console.log('Loading routing file: ' + key);
		}

		routeElements[key](router, params);
	});

	return router;
}

/**
 * Main exported function
 *
 * @param  {Array || String} paths	Target file's paths
 * @param  {Express router}  router The router object used in the app
 * @param  {Object}		 	 params Extra params, it passed to the routing files, too
 * @return {Express router}         The router object after register routing functions
 */
module.exports = (paths, router, params) => {
	if (typeof paths == 'undefined') {
		console.error('Missing \'paths\' argument!');
	} else if (typeof router == 'undefined') {
		console.error('Missing \'router\' argument!');
	} else {
		params = params || {};

		return processElements(readFiles(paths), router, params);
	}

	return null;
};