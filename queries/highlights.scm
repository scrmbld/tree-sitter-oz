; identifiers
(identifier) @variable

; calls
(call
  function: (identifier) @function)

(call
     arguments: (argument_list
                  (identifier) @variable.parameter)
     )

(skip
  [
   "Browse"
   "Basic"
   "Full"
   "Store"
   "Stack"
   "Check"
   ] @function)

(skip
  argument: (identifier) @variable.parameter)

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

(atom) @string.special

(comment) @comment

; Keywords
[
 "local"
 "in"
 "end"
 "skip"
 "thread"
 ] @keyword

[
 "if"
 "else"
 "elseif"
 "case"
 "of"
 "then"
 ] @keyword.conditional

[
 "proc"
 "fun"
 ] @keyword.function
