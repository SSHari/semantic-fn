# semantic-fn

Convert human readable text to executable JS. Assuming we have a function with a given set of parameters, `semantic-fn` provides a ways to describe the body of that function in words.

```js
const fnDescriptor = 'person.name.length greater than 5';

// Running the fnDescriptor through semantic-fn should
// return a function that does the following.
function checkNameLength(person) {
  return person['name']['length'] > 5;
}
```

## Why?

Converting a string to an executable function body might seem interesting, but does it really have any practical use? One potential challenge that could be addressed by a tool like `semantic-fn` is trying to send execution information via JSON over an API request. The simplest way to do something like that would be to just define the function as a string, send it via JSON and use the browser's `eval` logic to actually execute it. While that _may_ work, it's considered a best practice to avoid `eval` because it opens your application up to unwanted security concerns.

This is where a tool like `semantic-fn` comes into play. By defining a strict set of rules for the function descriptor string, we can allow for function logic to be safely transmitted via JSON without the same kinds of security concerns that plague `eval`.

### Rules

- Functions which `semantic-fn` return are pure
- Strict variable access from a predefined "global" state, function parameters or local variables
- Can only execute predefined functions, such as the string function `trim`

## How?

`semantic-fn` is a JS parser with a strict Context-Free Grammar that guarantees that only valid function descriptor strings are executed. If invalid syntax is used, `semantic-fn` will return a function that emits `undefined` (or a predefined default value) when invoked.

### Context-Free Grammar

The grammar specified by `semantic-fn` is designed to be as close to JavaScript as possible. The following expressions are allowed:

- **Literals:** Numbers, strings, Booleans, undefined and null.
- **Identifier:** A special type of literal which is either a reserved keyword or a variable name.
- **Unary expressions:** A prefix `!` which performs a logical not and `-` to negate a number and any `MODIFIER` which modifies the value after it.
- **Binary expressions:** The following infix arithmetic operators (+, -, \*, /) and the following logical operators (==, ===, !=, !==, <, <=, >, >=). These operators behave the same way you would expect them to behave in JavaScript.
- **Parentheses:** A way to group other expressions to show desired precedence.
- **Statements:** A statement is a series of tokens which can be executed in isolation. `semantic-fn` opts to return the value of a statement which means there's no need for an explicit `return` keyword and the last statement in the parsed descriptor string is the return value of the returned function. The following statement types exist:
  - **Expression**: Any expression followed by a new line which signifies the end of the expression.

#### Special Considerations

- **Scope**
  - TBD...
- **Modifiers**
  - `toString` - convert the following expression to a string
  - `toBool` - convert the following expression to a Boolean

#### Rules

The grammar rules are defined below. Instead of using something like [Backus-Naur form](https://en.wikipedia.org/wiki/Backus-Naur_form) or a variant of that, the following syntax has been implemented. Each rule consists of text, followed by ( → ), followed by a sequence of more text. The last character of each rule is a semicolon ( ; ) which indicates the end of the rule. Each rule may use a pipe ( | ) operator to express a choice. The star ( \* ) operator implies 0 or more times and the plus ( + ) operator implies 1 or more times. The Terminals are in double quotes or are uppercase words and nonterminals are lowercase words.

```haskell
-- Grammar Rules (in ascending order of precedence)
program → statement* EOT ;
statement → exprStmt ;
exprStmt → expression "\n" ;
expression → equality ;
equality → comparison ( ( "!=", "!==", "==", "===" ) comparison )* ;
comparison → term ( ( ">", ">=", "<", "<=" ) term )* ;
term → factor ( ( "-", "+" ) factor )* ;
factor → unary ( ( "/", "*" ) unary )* ;
unary → ( "!", "-", MODIFIER ) unary | primary ;
primary → NUMBER | STRING | IDENTIFIER | "true" | "false" | "undefined" | "null" | "(" expression ")" ;
```