"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchNodeStatement = void 0;
/**
 * Matches a single blockStatement against an array of Node types
 * @param blockStatement
 * @param target
 * @returns Boolean
 */
function matchNodeStatement(blockStatement, target) {
    if (blockStatement.length === target.length) {
        for (var index = 0; index < blockStatement.length; index++) {
            var elementBlock = blockStatement[index];
            var elementTarget = target[index];
            if (elementBlock.type != elementTarget)
                return false;
        }
        return true;
    }
    return false;
}
exports.matchNodeStatement = matchNodeStatement;
