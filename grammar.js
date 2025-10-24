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

  conflicts: $ => [
    // this conflicts because they can both start with identifiers
    [$.in, $._expression],
    // both of these can start with assignments
    [$.in, $._statement],
    // call statements and expressions have the exact same syntax
    [$._statement, $._expression]
  ],

  rules: {
    source_file: $ => $._definition,

    _definition: $ => $.block,

    block: $ => prec.left(1,
      repeat1($._statement),
    ),

    _statement: $ => choice(
      $.skip,
      $.local_definition,
      $.assignment,
      $.if_statement,
      $.case_statement,
      $.procedure_definition_statement,
      $.function_definition_statement,
      $.call,
      $.thread,
      $.by_need
    ),

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
      field("definitions", $.in),
      optional(field("body", $.block)),
      "end"
    ),

    in: $ => seq(
      repeat1(
        choice(
          $.identifier,
          $.assignment,
          $.function_definition_statement,
          $.procedure_definition_statement
        ),
      ),
      "in"
    ),

    assignment: $ => seq(
      field("left", choice(
        $.pattern,
        $.identifier
      )),
      "=",
      field("right", $._expression),
    ),

    in_block: $ => seq(
      optional(field("definitions", $.in)),
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
      field("consequence", $.in_block),
      "end"
    ),

    case_statement: $ => seq(
      "case",
      field("target", $._expression),
      "of",
      field("pattern", $.pattern),
      "then",
      field("body", $.in_block),
      repeat(field("alternative", $.case_alternate)),
      choice(
        field("alternative", $.else_clause),
        "end"
      )
    ),

    case_alternate: $ => seq(
      "[]",
      field("pattern", $._expression),
      "then",
      field("body", $.in_block)
    ),

    pattern: $ => choice(
      // NOTE: this includes invalid patterns
      $.binary_operator,
      $.parenthesis,
      $.record,
      $.atom
    ),

    procedure_definition_statement: $ => seq(
      "proc",
      "{",
      field("name", $.identifier),
      field("argument", repeat($.identifier)),
      "}",
      field("body", $.in_block),
      "end"
    ),

    function_definition_statement: $ => seq(
      "fun",
      "{",
      field("name", $.identifier),
      field("argument", repeat($.identifier)),
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
      field("argument", choice(
        // hoz has some restrictions, but Mozart allows any expression (I think)
        $._expression
      ))
    ),

    thread: $ => seq(
      "thread",
      field("body", $.block),
      "end"
    ),

    by_need: $ => seq(
      "byNeed",
      field("function", choice(
        $.function_definition_expression,
        $.procedure_definition_expression
      )),
      field("target", $.identifier)
    ),

    in_expression: $ => seq(
      optional(field("definitions", $.in)),
      repeat($._statement),
      field("return", prec(1, choice($._expression, $._statement_expression)))
    ),

    _expression: $ => choice(
      prec(1, $.procedure_definition_expression),
      prec(1, $.function_definition_expression),
      $.parenthesis,
      $.binary_operator,
      $.unary_operator,
      // functions are allowed and function calls look the same as procedure applications
      $.call,
      $.thread_expression,

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
      field("argument", repeat($.identifier)),
      "}",
      field("body", $.in_block),
      "end"
    ),

    function_definition_expression: $ => seq(
      "fun",
      "{",
      "$",
      field("argument", repeat($.identifier)),
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

    // this needs higher precedence because it overlaps with thread
    thread_expression: $ => seq(
      "thread",
      $.in_expression,
      "end"
    ),

    local_definition_expression: $ => seq(
      "local",
      field("definitions", $.in),
      repeat($._statement),
      field("return", choice($._expression, $._statement_expression)),
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
      field("target", $._expression),
      "of",
      field("pattern", $.pattern),
      "then",
      field("body", $.in_expression),
      repeat(field("alternative", $.case_expression_alternate)),
      // this cursed langauge allows if & case expressions with no else
      choice(
        field("alternative", $.else_expression_clause),
        "end"
      )
    ),

    case_expression_alternate: $ => seq(
      "[]",
      field("pattern", $.pattern),
      "then",
      field("body", $.in_expression)
    ),



    // first letter of identifier must be uppercase
    identifier: $ => /\??[A-Z]([A-Z]|[a-z]|[0-9]|_)*/,

    _type: $ => choice(
      $.record,
      $.tuple,
      $.list,
      $._number,
      $.string,
      $._literal
    ),

    record: $ => prec(0, seq(
      field("label", $._literal),
      "(",
      repeat1(field("field", $.record_field)),
      ")"
    )),

    record_field: $ => seq(
      field("name", choice(
        $.atom,
        $.bool,
        $.int
      )),
      ":",
      field("value", $._expression)
    ),

    tuple: $ => prec(1, seq(
      field("label", $._literal),
      "(",
      repeat(
        field("field", $._expression)
      ),
      ")"
    )),

    list: $ => seq(
      "[",
      repeat($._expression),
      "]"
    ),

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

    // https://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: $ => token(choice(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),
  }
});
