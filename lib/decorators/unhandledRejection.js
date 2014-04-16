/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var async = require('../async');

	var logError = (function() {
		if(typeof console !== 'undefined') {
			if(typeof console.error !== 'undefined') {
				return function(e) {
					console.error(e);
				};
			}

			if(typeof console.log !== 'undefined') {
				return function(e) {
					console.log(e);
				};
			}
		}

		return noop;
	}());

	return function unhandledRejection(Promise) {
		var unhandledRejections = [];
		var queued = false;

		function reportUnhandledRejections() {
			queued = false;
			unhandledRejections.forEach(function (r) {
				if(!r.handled) {
					logError('Possibly unhandled rejection ' + formatError(r.value));
				}
			});
			unhandledRejections = [];
		}

		Promise.onUnhandledRejection = function(rejection) {
			unhandledRejections.push(rejection);
			if(!queued) {
				queued = true;
				async(reportUnhandledRejections);
			}
		};

		Promise.onUnhandledRejectionHandled = noop;

		Promise.onFatalRejection = function(rejection) {
			var e = rejection.value;
			async(function() {
				throw e;
			});
		};

		return Promise;
	};

	function formatError(e) {
		if(typeof e === 'object' && e.stack) {
			return e.stack;
		}

		var s = String(e);
		if(s === '[object Object]' && typeof JSON !== 'undefined') {
			s = JSON.stringify(e);
		}

		return s;
	}

	function noop() {}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
