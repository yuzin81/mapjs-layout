/*global module, require*/
var _ = require('underscore'),
	nodeToBox = require('./node-to-box');

module.exports = function LayoutModel(emptyLayout) {
	'use strict';
	var self = this,
		options = {
			coneRatio: 0.5,
			majorAxisRatio: 3
		},
		layout,
		getNodesForPredicate = function (predicate) {
			var nodes = layout && _.values(layout.nodes),
				filtered = nodes && _.filter(nodes, predicate);
			return nodes && filtered.length && filtered;
		},
		getNodesDown = function (referenceNode, coneRatio) {
			var predicate  = function (node) {
				var dy = (node.y + node.height) - (referenceNode.y + referenceNode.height),
					x1 = referenceNode.x  - Math.abs(dy * coneRatio),
					x2 = referenceNode.x  + referenceNode.width + Math.abs(dy * coneRatio);

				if (node.id === referenceNode.id || node.y <= Math.round(referenceNode.y + referenceNode.height * 0.5)) {
					return false;
				}
				if (coneRatio !== undefined && (node.x > x2 || (node.x + node.width) < x1)) {
					return false;
				}
				return true;
			};
			return getNodesForPredicate(predicate);
		},
		getNodesRight = function (referenceNode, coneRatio) {
			var predicate  = function (node) {
				var dx = (node.x + node.width) - (referenceNode.x + referenceNode.width),
					y1 = referenceNode.y  - Math.abs(dx * coneRatio),
					y2 = referenceNode.y  + referenceNode.height + Math.abs(dx * coneRatio);

				if (node.id === referenceNode.id || node.x <= Math.round(referenceNode.x + referenceNode.width * 0.5)) {
					return false;
				}
				if (coneRatio !== undefined && (node.y > y2 || (node.y + node.height) < y1)) {
					return false;
				}
				return true;
			};
			return getNodesForPredicate(predicate);
		},
		getNodesUp = function (referenceNode, coneRatio) {
			var predicate = function (node) {
				var dy = node.y - referenceNode.y,
					x1 = referenceNode.x - Math.abs(dy * coneRatio),
					x2 = referenceNode.x + referenceNode.width + Math.abs(dy * coneRatio);

				if (node.id === referenceNode.id || (node.y + node.height) >= Math.round(referenceNode.y + referenceNode.height * 0.5)) {
					return false;
				}
				if (coneRatio !== undefined && (node.x > x2 || (node.x + node.width) < x1)) {
					return false;
				}
				return true;
			};
			return getNodesForPredicate(predicate);
		},
		getNodesLeft = function (referenceNode, coneRatio) {
			var predicate = function (node) {
				var dx = node.x - referenceNode.x,
					y1 = referenceNode.y - Math.abs(dx * coneRatio),
					y2 = referenceNode.y + referenceNode.height + Math.abs(dx * coneRatio);

				if (node.id === referenceNode.id || (node.x + node.width) >= Math.round(referenceNode.x + referenceNode.width * 0.5)) {
					return false;
				}
				if (coneRatio !== undefined && (node.y > y2 || (node.y + node.height) < y1)) {
					return false;
				}
				return true;
			};
			return getNodesForPredicate(predicate);
		},
		getNearest = function (referenceNode, nodes, xRatio, yRatio) {
			var result,
				referenceNodeCenter = {
					x: Math.round(referenceNode.x + referenceNode.width * 0.5),
					y: Math.round(referenceNode.y + referenceNode.height * 0.5)
				},
				calculateDistance = function (point1, point2) {
					var dx = xRatio * (point1.x - point2.x),
						dy = yRatio * (point1.y - point2.y);
					return Math.pow(dx, 2)  + Math.pow(dy, 2);
				};
			if (!nodes) {
				return false;
			}
			if (nodes.length === 1) {
				return nodes[0];
			}
			result = _.min(nodes, function (node) {
				var d = [
						calculateDistance(node, referenceNodeCenter),
						calculateDistance({x: node.x + node.width, y: node.y + node.height}, referenceNodeCenter),
						calculateDistance({x: node.x + node.width, y: node.y}, referenceNodeCenter),
						calculateDistance({x: node.x, y: node.y + node.height}, referenceNodeCenter),
						calculateDistance({x: Math.round(node.x + node.width * 0.5), y: Math.round(node.y + node.height * 0.5)}, referenceNodeCenter)
					];
				return _.min(d);
			});
			return result;
		};

	self.getNode = function (nodeId) {
		return (layout && layout.nodes && layout.nodes[nodeId]);
	};
	self.getNodeBox = function (nodeId) {
		return nodeToBox(self.getNode(nodeId));
	};
	self.setLayout = function (newLayout) {
		layout = newLayout || emptyLayout;
	};
	self.getLayout = function () {
		return layout || emptyLayout;
	};
	self.nodeIdLeft = function (nodeId) {
		var referenceNode = self.getNode(nodeId),
			nodes = referenceNode && (getNodesLeft(referenceNode, options.coneRatio) || getNodesLeft(referenceNode)),
			node = nodes && getNearest(referenceNode, nodes, 1, options.majorAxisRatio);
		return node && node.id;
	};
	self.nodeIdRight = function (nodeId) {
		var referenceNode = self.getNode(nodeId),
			nodes = referenceNode && (getNodesRight(referenceNode, options.coneRatio) || getNodesRight(referenceNode)),
			node = nodes && getNearest(referenceNode, nodes, 1, options.majorAxisRatio);
		return node && node.id;
	};

	self.nodeIdUp = function (nodeId) {
		var referenceNode = self.getNode(nodeId),
			nodes = referenceNode && (getNodesUp(referenceNode, options.coneRatio) || getNodesUp(referenceNode)),
			node = nodes && getNearest(referenceNode, nodes, options.majorAxisRatio, 1);
		return node && node.id;
	};
	self.nodeIdDown = function (nodeId) {
		var referenceNode = self.getNode(nodeId),
			nodes = referenceNode && (getNodesDown(referenceNode, options.coneRatio) || getNodesDown(referenceNode)),
			node = nodes && getNearest(referenceNode, nodes, options.majorAxisRatio, 1);
		return node && node.id;
	};
	self.getOrientation = function () {
		return (layout && layout.orientation) || 'standard';
	};
	self.layoutBounds = function () {
		var minx, miny, maxx, maxy;
		if (_.isEmpty(layout.nodes)) {
			return false;
		}
		_.each(layout.nodes, function (node) {
			if (!minx) {
				minx = node.x;
				miny = node.y;
				maxx = node.x + node.width;
				maxy = node.y + node.height;
			} else {
				minx = Math.min(node.x, minx);
				miny = Math.min(node.y, miny);
				maxx = Math.max(node.x + node.width, maxx);
				maxy = Math.max(node.y + node.height, maxy);
			}
		});
		return {minX: minx, minY: miny, maxX: maxx, maxY: maxy, width: (maxx - minx), height: (maxy - miny)};
	};

	self.clipRectTransform = function (centerNodeId, options) {
		var centerNode = self.getNode(centerNodeId),
			bounds = self.layoutBounds(),
			padding = (options && options.padding) || 0,
			scale = (options && options.scale) || 1,
			imgCenter = {
				x: centerNode.x + (centerNode.width / 2),
				y: centerNode.y + (centerNode.height / 2)
			};
		if (options && options.clipRect) {
			return {
				x: (options.clipRect.width / 2) - imgCenter.x,
				y: (options.clipRect.height / 2) - imgCenter.y,
				width: options.clipRect.width,
				height: options.clipRect.height
			};

		} else {
			return {
				x: -1 *  bounds.minX + Math.floor (padding / scale), // in scaled coordinates
				y: -1 *  bounds.minY + Math.floor (padding / scale), // in scaled coordinates
				width: bounds.width * scale + 2 * padding,
				height: bounds.height * scale + 2 * padding,
				scale: scale
			};
		}
	};

};
