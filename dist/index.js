#! /usr/bin/env node
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var t = require("@babel/types");
var fs_1 = require("fs");
var parser_1 = require("@babel/parser");
var generator_1 = require("@babel/generator");
var traverse_1 = require("./traverse");
var utils_1 = require("./utils");
var cardinal_1 = require("cardinal");
var args = process.argv;
if (args.length < 3) {
    console.log("Usage: ./js-deobfuscator samples/obfuscated.js > deobfuscated.js");
    process.exit();
}
// read file
var file = (0, fs_1.readFileSync)(args[2], 'utf-8');
// parse code, generate ast
var ast = (0, parser_1.parse)(file);
var stringTableFunction, tableIndexFixerFunction, tableFunctionHelper;
var indexFixerName;
var deobfuscatorCode = "";
/* parse -> walk -> types -> generate */
(0, traverse_1.default)(ast, {
    enter: function (node, parent) {
        if (t.isFunctionDeclaration(node)) {
            // 1. find string table function, keep hold of its body
            // target is a FunctionDeclaration 
            var blockStmt = node.body.body;
            // with exactly: 1 VariableDeclaration 1 ExpressionStatement 1 ReturnStatement for string table function
            var foundTableFunction = (0, utils_1.matchNodeStatement)(blockStmt, ["VariableDeclaration", "ExpressionStatement", "ReturnStatement"]);
            // and exactly:  1 VariableDeclaration 1 ReturnStatement for string table index fixer function
            var foundTableIndexFixerFunction = (0, utils_1.matchNodeStatement)(blockStmt, ["VariableDeclaration", "ReturnStatement"]);
            if (foundTableFunction) {
                // keep hold of it
                stringTableFunction = (0, generator_1.default)(node).code;
                deobfuscatorCode += stringTableFunction;
                // replace with empty statement in ast
                return t.emptyStatement();
            }
            if (foundTableIndexFixerFunction) {
                // keep hold of it
                indexFixerName = node.id.name;
                tableIndexFixerFunction = (0, generator_1.default)(node).code;
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
                    tableFunctionHelper = (0, generator_1.default)(node).code;
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
            if (t.isCallExpression(needle) && needle.arguments.length == 0) {
                // we are in target obfuscated body
                var index = 1;
                var val;
                var newNode_1, evaluated_1;
                while (index < expressions.length) {
                    var element = expressions[index];
                    if (t.isNode(element)) {
                        // traverse and find obfuscated calls
                        (0, traverse_1.default)(element, {
                            enter: function (node, parent) {
                                if (t.isCallExpression(node)) {
                                    if (node.arguments.length == 1 && t.isNumericLiteral(node.arguments[0])) {
                                        val = node.arguments[0].extra.raw;
                                        var evalCode = deobfuscatorCode;
                                        if (val.startsWith("0x")) {
                                            evalCode += indexFixerName + "(" + val + ");";
                                            // evaluate call
                                            evaluated_1 = eval(evalCode);
                                            // formulate as a stringLateral
                                            newNode_1 = t.stringLiteral(evaluated_1);
                                            // replace node
                                            return newNode_1;
                                        }
                                    }
                                }
                            },
                            exit: function (node, parent) { }
                        });
                    }
                    index++;
                }
            }
        }
    },
    exit: function (node, parent) { },
});
var output;
var ok = false;
// generate deobfuscated code 
(0, traverse_1.default)(ast, {
    enter: function (node, parent) {
        if (t.isExpressionStatement(node) && t.isSequenceExpression(node.expression)) {
            var expressions = node.expression.expressions;
            var needle = expressions[0];
            if (t.isCallExpression(needle) && needle.arguments.length == 0) {
                // we are in target obfuscated body
                var out = t.sequenceExpression(expressions.slice(1, expressions.length));
                output = (0, generator_1.default)(out).code;
                ok = true;
            }
        }
    },
    exit: function (node, parent) { }
});
// print deobfuscated code
if (ok)
    console.log((0, cardinal_1.highlight)(output));
else
    console.warn("Error deobfuscating, debug obfuscated code manually and change accordingly.");
