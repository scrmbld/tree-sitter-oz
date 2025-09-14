; identifiers
(identifier) @identifier

; calls
(call
  function: (identifier) @function)

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

(string) @string

(comment) @comment
