/**
 * @file A tree-sitter parser for the Oz programming language.
 * @author Cynthia Allen <cynthiaallen228@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "oz",

  extras: $ => [
    $.comment, /\s/
  ],

  rules: {
    source_file: $ => repeat($._definition),

    _definition: $ => prec.left(0, choice(
      repeat1($._statement)
    )),

    block: $ => seq(
      repeat1($._statement),
    ),

    _statement: $ => choice(
      $.skip,
      $.local_definition,
      $.assignment,
      $.if_statement,
      $.case_statement,
      $.procedure_application
      // TODO: other kinds of statements (e.g., if, etc)
    ),

    skip: $ => choice(
      "skip",
      seq(
        "skip",
        "Browse",
        $.identifier
      ),
      // NOTE: I don't know what purpose this serves in the langauge
      seq(
        "skip",
        "Basic"
      ),
      seq(
        "skip",
        "Store"
      )
    ),

    local_definition: $ => seq(
      'local',
      repeat1($.identifier),
      'in',
      $.block,
      "end"
    ),

    assignment: $ => choice(
      seq(
        $.identifier,
        '=',
        $._expression
      ),
      prec(0, $.procedure_definition)
    ),

    if_statement: $ => choice(
      seq(
        "if",
        $._expression,
        "then",
        $.block,
        choice(
          seq(
            "else",
            $.block,
            "end"
          ),
          "end"
        )
      )
    ),

    case_statement: $ => seq(
      "case",
      $.identifier,
      "of",
      // TODO: something here
      "then",
      $.block,
      "else",
      $.block,
      "end"
    ),

    procedure_application: $ => seq(
      "{",
      $.identifier,
      repeat1(
        choice(
          $.identifier,
          $._type
        )
      ),
      "}"
    ),

    _expression: $ => choice(
      prec(1, $.procedure_definition),
      $._type,
      $.identifier,
      $.add,
      $.subtract,
      $.multiply,
      $.divide,
      $.negate
      // TODO: other kinds of expressions
      // TODO: make sure precedences and associativities of rules matches the interpreter
    ),

    procedure_definition: $ => seq(
      "proc",
      "{",
      choice($.identifier, "$"),
      repeat($.identifier),
      "}",
      $.block,
      "end"
    ),

    add: $ => prec.left(0, seq(
      $._expression,
      '+',
      $._expression
    )),

    subtract: $ => prec.left(0, seq(
      $._expression,
      '-',
      $._expression
    )),

    multiply: $ => prec.left(1, seq(
      $._expression,
      '*',
      $._expression
    )),

    divide: $ => prec.left(1, seq(
      $._expression,
      '/',
      $._expression
    )),

    negate: $ => prec.left(2, seq(
      '-',
      $._expression
    )),

    // first letter of identifier must be uppercase
    identifier: $ => /[A-Z]([A-Z]|[a-z]|[0-9]|_)*/,

    _type: $ => choice(
      $.record,
      $.tuple,
      $.list,
      $.number,
      $.string,
      $._literal
    ),

    record: $ => seq(
      $._literal,
      "(",
      repeat1(
        seq(
          choice(
            $.atom,
            $.bool,
            // NOTE: this should be ints only, but right now we do not distinguish between ints and floats
            $.number
          ),
          ":",
          $.identifier
        )
      ),
      ")"
    ),

    tuple: $ => seq(
      $._literal,
      "(",
      repeat1(
        $.identifier
      ),
      ")"
    ),

    // TODO: make sure this is actually how Oz lists work
    // also it might be done differently in Hoz than from the book
    // also also make sure associativity is correct
    list: $ => prec.left(repeat1(
      seq(
        $.identifier,
        "|",
        $.identifier
      )
    )),


    number: $ => /\d+|\d+\.\d*/,

    string: $ => seq(
      "\"",
      /[^"]*/,
      "\""
    ),

    _literal: $ => choice(
      $.bool,
      $.atom
    ),

    bool: $ => /true|false/,

    atom: $ => /([a-z]+\w*)|'.+'/,

    comment: $ => token(seq('//', /[^\r\n]*/))
  }
});
