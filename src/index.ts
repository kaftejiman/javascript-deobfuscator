#! /usr/bin/env node

/** Example of javascript-obfuscator deobfuscation with the following parameters:
 *      - Self defending
 *      - Control flow flattening
 *      - Dead code injection
 * 
 * A de-obfuscation pseudo algorithm for such configuration:
 *  1. find string table function, keep hold of its body
 *  2. find string table index fixer function, keep hold of it
 *  3. find control flow flattening helper function, keep hold of it
 *  4. find actual obfuscated code.
 *  5. resolve obfuscated names by evaluating earlier found functions
 *  6. regenerate de-obfuscated clean code
 * 
 *  Usage: ./js-deobfuscator samples/iroot.js > deobfuscated_iroot.js
 * 
 *  Note: works only with the configuration above, to use effectively try on different samples and tackle edge cases.
 * 
 */

import * as t from '@babel/types';
import { readFileSync } from 'fs';
import { parse } from '@babel/parser';
import generate from '@babel/generator';
import fastTraverse  from './traverse';
import { matchNodeStatement } from './utils';
import { highlight } from 'cardinal';
import { inspect } from 'util';

const args = process.argv;

if (args.length < 3) {
  console.log("Usage: ./js-deobfuscator samples/obfuscated.js > deobfuscated.js");
  process.exit();
}

// read file
const file = readFileSync(args[2], 'utf-8');
// parse code, generate ast
var ast = parse(file);

var stringTableFunction, tableIndexFixerFunction, tableFunctionHelper;
var indexFixerName: string;
var deobfuscatorCode = "";

/* parse -> walk -> types -> generate */
fastTraverse(ast, {
  enter(node: t.Node, parent: t.Node) {

    if (t.isFunctionDeclaration(node)) {
      // 1. find string table function, keep hold of its body
      // target is a FunctionDeclaration 
      var blockStmt = node.body.body;
      // with exactly: 1 VariableDeclaration 1 ExpressionStatement 1 ReturnStatement for string table function
      var foundTableFunction = matchNodeStatement(blockStmt, ["VariableDeclaration", "ExpressionStatement", "ReturnStatement"]);
      // and exactly:  1 VariableDeclaration 1 ReturnStatement for string table index fixer function
      var foundTableIndexFixerFunction = matchNodeStatement(blockStmt, ["VariableDeclaration", "ReturnStatement"]);

      if (foundTableFunction) {
        // keep hold of it
        stringTableFunction = generate(node).code;
        deobfuscatorCode += stringTableFunction;
        // replace with empty statement in ast
        return t.emptyStatement();
      }

      if (foundTableIndexFixerFunction) {
        // keep hold of it
        indexFixerName = node.id.name;
        tableIndexFixerFunction = generate(node).code;
        deobfuscatorCode += tableIndexFixerFunction;
        // replace with empty statement in ast
        return t.emptyStatement();
      }

    }

    // Find control flow flattening helper function
    // append to output code
    if (t.isExpressionStatement(node) && t.isCallExpression(node.expression)) {
      var targetExpression = node.expression.callee;
      if (t.isFunctionExpression(targetExpression) && targetExpression.params.length == 2) {
        if (node.expression.arguments.length == 2) {
          tableFunctionHelper = generate(node).code;
          deobfuscatorCode += tableFunctionHelper;
        }
      }
    }

    // Find the obfuscated body
    // can be distinguished from the use of "Self defending" option
    // obfuscated body is in an ExpressionStatement with the first member as a CallExpression with no arguments 
    if (t.isExpressionStatement(node) && t.isSequenceExpression(node.expression)) { 
      var expressions = node.expression.expressions;
      var needle = expressions[0];
      if (t.isCallExpression(needle) && needle.arguments.length == 0 ) {
        // we are in target obfuscated body
        var index = 1;
        var val: string;
        let newNode, evaluated;

        while (index < expressions.length) {
          const element = expressions[index];
          if (t.isNode(element)) {                
            // traverse and find obfuscated calls
            fastTraverse(element, {
                enter(node: t.Node, parent: t.Node) {
                  if (t.isCallExpression(node)) {    
                    if (node.arguments.length == 1 && t.isNumericLiteral(node.arguments[0])) {
                      val = <string>node.arguments[0].extra.raw;
                      let evalCode = deobfuscatorCode;
                      if (val.startsWith("0x")) {
                        evalCode += indexFixerName + "(" + val + ");";
                        // evaluate call
                        evaluated = eval(evalCode);
                        // formulate as a stringLateral
                        newNode = t.stringLiteral(evaluated);
                        // replace node
                        return newNode;
                      }
                    }
                  }
                    
                },
                exit(node: t.Node, parent: t.Node) { }
            });
          }
          index++;
        }
      }

    }
    
  },
  exit(node: t.Node, parent: t.Node) {},
});

var output;
let ok: boolean = false;
// generate deobfuscated code 
fastTraverse(ast, {
  enter(node: t.Node, parent: t.Node) {
    if (t.isExpressionStatement(node) && t.isSequenceExpression(node.expression)) {
      var expressions = node.expression.expressions;
      var needle = expressions[0];
      if (t.isCallExpression(needle) && needle.arguments.length == 0) {
        // we are in target obfuscated body
        let out = t.sequenceExpression(expressions.slice(1, expressions.length));
        output = generate(out).code;
        ok = true;
      }
    }
  },
  exit(node: t.Node, parent: t.Node) { }
});

// print deobfuscated code
if (ok)
  console.log(highlight(output));
else
  console.warn("Error deobfuscating, debug obfuscated code manually and change accordingly.");

