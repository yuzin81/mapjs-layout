/*global module, require*/
var _ = require('underscore'),
	regCSSRGB = new RegExp(/^rgb\(([^,\s]+)[,\s]*([^,\s]+)[,\s]*([^,\s\()]+).*$/),
	fromCSSRGB = function (colorString) {
		'use strict';
		var matched;
		if (regCSSRGB.test(colorString)) {

			matched = colorString.match(regCSSRGB);
			if (matched.length === 4) {
				return _.map(matched.slice(1), function (i) {
					return parseInt(i);
				});
			}
		}
	},
	fromHexString = function (colorString) {
		'use strict';
		var match = colorString.toString(16).match(/[a-f0-9]{6}/i),
			integer,r, g, b;
		if (match) {
			integer = parseInt(match[0], 16);
			r = (integer >> 16) & 0xFF;
			g = (integer >> 8) & 0xFF;
			b = integer & 0xFF;

			return [r, g, b];
		}
	};
module.exports = function convertToRGB(colorString) {
	'use strict';
	return fromCSSRGB(colorString) || fromHexString(colorString) || [0,0,0];
};
