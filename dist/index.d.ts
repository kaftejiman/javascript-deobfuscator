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
export {};
