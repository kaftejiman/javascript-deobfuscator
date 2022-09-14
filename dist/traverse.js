"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var t = require("@babel/types");
/**
 * Performs a fast traverse on an AST node.
 * @param node The AST node to traverse.
 * @param visitor The visitor object.
 * @param parent The parent AST node (internal use only).
 * @param parentKey The key the child is on the parent (internal use only).
 * @param visitedNodes The set of already visited nodes (internal use only).
 */
function fastTraverse(node, visitor, parent, parentKey, visitedNodes) {
    var _a;
    if (!visitedNodes) {
        visitedNodes = new Set();
    }
    if (!node || visitedNodes.has(node)) {
        return;
    }
    visitedNodes.add(node);
    var replacement = visitor.enter(node, parent);
    if (replacement && parent && parentKey != undefined) {
        if (Array.isArray(replacement)) {
            if (replacement.length > 0) {
                if (typeof parentKey != 'string') {
                    (_a = parent[parentKey[0]]).splice.apply(_a, __spreadArray([parentKey[1], 1], replacement, false));
                }
                node = replacement[0];
            }
        }
        else {
            if (typeof parentKey == 'string') {
                parent[parentKey] = replacement;
            }
            else {
                parent[parentKey[0]][parentKey[1]] = replacement;
            }
            node = replacement;
        }
        return fastTraverse(node, visitor, parent, parentKey, visitedNodes);
    }
    if (visitor.skip) {
        visitor.skip = false;
        return;
    }
    if (visitor.break) {
        return;
    }
    var keys = t.VISITOR_KEYS[node.type];
    if (!keys) {
        return;
    }
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        var subNode = node[key];
        if (Array.isArray(subNode)) {
            for (var i = 0; i < subNode.length; i++) {
                fastTraverse(subNode[i], visitor, node, [key, i], visitedNodes);
                if (visitor.break) {
                    return;
                }
            }
        }
        else {
            fastTraverse(subNode, visitor, node, key, visitedNodes);
        }
        if (visitor.break) {
            return;
        }
    }
    if (visitor.exit) {
        visitor.exit(node, parent);
    }
}
exports.default = fastTraverse;
