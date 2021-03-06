/*global module, require*/
var Theme = require('./theme'),
	extractConnectors = require('./layouts/extract-connectors'),
	layoutLinks = require('./layouts/links'),
	defaultLayouts = {
		'standard': require('./layouts/standard'),
		'top-down': require('./layouts/top-down')
	},
	attachStyles = function (nodes, theme) {
		'use strict';
		Object.keys(nodes).forEach(function (nodeKey) {
			var node = nodes[nodeKey];
			node.styles = theme.nodeStyles(node.level, node.attr);
		});
		return nodes;
	};

module.exports = function calculateLayout(idea, dimensionProvider, optional) {
	'use strict';
	var margin, orientation,
		layouts = (optional && optional.layouts) || defaultLayouts,
		theme = (optional && optional.theme) || new Theme({}),
		calculator,
		result;
	margin = theme.attributeValue(['layout'], [], ['spacing'], {h: 20, v: 20});
	orientation = theme.attributeValue(['layout'], [], ['orientation'], 'standard');
	calculator = layouts[orientation] || layouts.standard;
	result = calculator(idea, dimensionProvider, {h: (margin.h || margin), v: (margin.v || margin)});
	return {
		orientation: orientation,
		nodes: attachStyles(result, theme),
		connectors: extractConnectors(idea, result),
		links: layoutLinks(idea, result),
		theme: idea.attr && idea.attr.theme
	};
};

