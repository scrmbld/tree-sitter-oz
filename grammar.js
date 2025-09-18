/**
 * @file A tree-sitter parser for the Oz programming language.
 * @author Cynthia Allen <cynthiaallen228@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// TODO: Implement "practucal language" features

module.exports = grammar({
  name: "oz",

  extras: $ => [
    $.comment, /\s/
  ],

  rules: {
    source_file: $ => repeat($._definition),

    _definition: $ => $.block,

    block: $ => prec.left(1, seq(
      repeat1($._statement),
    )),

    _statement: $ => prec(1, choice(
      $.skip,
      $.local_definition,
      $.assignment,
      $.if_statement,
      $.case_statement,
      $.procedure_definition_statement,
      $.function_definition_statement,
      $.call
    )),

    skip: $ => seq(
      "skip",
      choice(
        seq("Browse", field("argument", $.identifier)),
        "Basic",
        "Stack",
        "Store",
        "Full",
        "Check"
      )
    ),

    local_definition: $ => seq(
      "local",
      $.in,
      optional($.block),
      "end"
    ),

    in: $ => seq(
      repeat1(
        choice(
          $.identifier,
          $.assignment
        ),
      ),
      "in"
    ),

    assignment: $ => choice(
      seq(
        choice(
          field("left", $.identifier),
          field("left", $.record),
          field("left", $.tuple)
        ),
        "=",
        field("right", $._expression)
      ),
      $.procedure_definition_expression
    ),

    in_block: $ => seq(
      optional($.in),
      $.block
    ),

    if_statement: $ => choice(
      seq(
        "if",
        field("condition", $._expression),
        "then",
        field("consequence", $.in_block),
        repeat(field("alternative", $.elseif_clause)),
        choice(
          field("alternative", $.else_clause),
          "end"
        )
      )),

    elseif_clause: $ => seq(
      "elseif",
      field("condition", $._expression),
      "then",
      field("consequence", $.in_block)
    ),

    else_clause: $ => seq(
      "else",
      field("body", $.in_block),
      "end"
    ),

    case_statement: $ => seq(
      "case",
      field("condition", $._expression),
      "of",
      field("pattern", $._expression),
      "then",
      field("body", $.in_block),
      repeat(field("alternative", $.case_alternate)),
      field("alternative", $.else_clause)
    ),

    case_alternate: $ => seq(
      "[]",
      field("pattern", $._expression),
      "then",
      field("body", $.in_block)
    ),

    procedure_definition_statement: $ => seq(
      "proc",
      "{",
      field("name", $.identifier),
      field("parameters", repeat($.identifier)),
      "}",
      field("body", $.block),
      "end"
    ),

    function_definition_statement: $ => seq(
      "fun",
      "{",
      field("name", $.identifier),
      field("parameters", repeat($.identifier)),
      "}",
      field("body", $.in_expression),
      "end"
    ),

    call: $ => seq(
      "{",
      field("function", $.identifier),
      optional(field("arguments", $.argument_list)),
      "}"
    ),

    argument_list: $ => repeat1(
      choice(
        $.identifier,
        $._type
      )
    ),


    in_expression: $ => seq(
      optional($.in),
      repeat($._statement),
      field("return", choice($._expression, $._statement_expression))
    ),

    _expression: $ => choice(
      prec(1, $.procedure_definition_expression),
      prec(1, $.function_definition_expression),
      $.parenthesis,
      $.binary_operator,
      $.unary_operator,
      // functions are allowed and function calls look the same as procedure applications
      $.call,

      $.identifier,
      $._type,
      // TODO: make sure precedences and associativities of rules matches the interpreter
    ),

    // expression versions of statements for functions
    _statement_expression: $ => choice(
      $.local_definition_expression,
      $.if_expression,
      $.case_expression,
    ),

    parenthesis: $ => prec.left(0, seq(
      "(",
      $._expression,
      ")"
    )),


    procedure_definition_expression: $ => seq(
      "proc",
      "{",
      "$",
      field("parameters", repeat($.identifier)),
      "}",
      field("body", $.block),
      "end"
    ),

    function_definition_expression: $ => seq(
      "fun",
      "{",
      "$",
      field("parameters", repeat($.identifier)),
      "}",
      field("body", $.in_expression),
      "end"
    ),

    binary_operator: $ => prec.left(2, seq(
      field("left", $._expression),
      choice(
        "==",
        "\\=",
        "=<",
        "<",
        ">=",
        ">",
        "+",
        "-",
        "*",
        "/",
        "div",
        "mod",
        ".",
        "#", // tuple
        "|" // list
      ),
      field("right", $._expression)
    )),

    unary_operator: $ => prec.left(1, seq(
      "-",
      $._expression
    )),

    local_definition_expression: $ => seq(
      "local",
      $.in_expression,
      "end"
    ),

    if_expression: $ => choice(
      seq(
        "if",
        field("condition", $._expression),
        "then",
        field("consequence", $.in_expression),
        repeat(field("alternative", $.elseif_expression_clause)),
        choice(
          field("alternative", $.else_expression_clause),
          "end"
        )
      )
    ),

    elseif_expression_clause: $ => seq(
      "elseif",
      field("condition", $._expression),
      "then",
      field("body", $.in_expression)
    ),

    else_expression_clause: $ => seq(
      "else",
      optional($.in_expression),
      "end"
    ),

    case_expression: $ => seq(
      "case",
      field("condition", $._expression),
      "of",
      field("pattern", $._expression),
      "then",
      field("body", $.in_expression),
      repeat(field("alternative", $.case_expression_alternate)),
      field("alternative", $.else_expression_clause)
    ),

    case_expression_alternate: $ => seq(
      "[]",
      field("pattern", $._expression),
      "then",
      field("body", $.in_expression)
    ),



    // first letter of identifier must be uppercase
    identifier: $ => /[A-Z]([A-Z]|[a-z]|[0-9]|_)*/,

    _type: $ => choice(
      $.record,
      $.tuple,
      $._number,
      $.string,
      $._literal
    ),

    record: $ => prec(0, seq(
      $._literal,
      "(",
      repeat1(seq(
        choice(
          $.atom,
          $.bool,
          $.int
        ),
        ":",
        $._expression
      )),
      ")"
    )),

    tuple: $ => prec(1, seq(
      $._literal,
      "(",
      repeat1(
        $.identifier
      ),
      ")"
    )),

    _number: $ => choice(
      $.int,
      $.float
    ),

    int: $ => /\d+/,

    float: $ => /\d+\.\d*/,

    string: $ => seq(
      "\"",
      /[^"]*/,
      "\""
    ),

    _literal: $ => prec(2, choice(
      $.bool,
      $.atom
    )),

    bool: $ => choice("true", "false"),

    atom: $ => /([a-z]+\w*(\(\))?)|\`.+\`|'.+'/,

    comment: $ => token(seq("//", /[^\r\n]*/))
  }
});
