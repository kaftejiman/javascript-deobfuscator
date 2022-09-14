import * as t from '@babel/types';

/**
 * Matches a single blockStatement against an array of Node types
 * @param blockStatement 
 * @param target 
 * @returns Boolean
 */
export function matchNodeStatement(blockStatement: t.Statement[], target: Array<string>): Boolean {
  if(blockStatement.length === target.length){
    for (let index = 0; index < blockStatement.length; index++) {
      const elementBlock = blockStatement[index];
      const elementTarget = target[index];
      if (elementBlock.type != elementTarget)
        return false;
    }
    return true;
  }
  return false;
}