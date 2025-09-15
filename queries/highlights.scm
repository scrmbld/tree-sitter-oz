; identifiers
(identifier) @variable

; calls
(call
  function: (identifier) @function)

(call
     arguments: (argument_list
                  (identifier) @variable.parameter)
     )

(skip) @function

; Keyworkds
[
 "local"
 "in"
 "end"
 "if"
 "then"
 "elseif"
 "else"
 "case"
 "proc"
 "fun"
 "skip"
 ] @keyword

; Literals

[
 (int)
 (float)
 ] @number

[
 "true"
 "false"
 ] @boolean

(string) @string

(comment) @comment
