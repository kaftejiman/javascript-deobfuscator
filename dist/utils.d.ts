import * as t from '@babel/types';
/**
 * Matches a single blockStatement against an array of Node types
 * @param blockStatement
 * @param target
 * @returns Boolean
 */
export declare function matchNodeStatement(blockStatement: t.Statement[], target: Array<string>): Boolean;
