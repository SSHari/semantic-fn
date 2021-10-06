import { Expr, createAssignment, createBinary, createGrouping, createLiteral, createUnary, createVariable } from './expressions';
import { Stmt, LetDecl, createBlock, createExprStmt, createLetDecl } from './statements';
import { Token, TokenString, TokenType } from './tokens';
import { CaptureError } from './errors';

const {
  // Single character tokens
  LEFT_BRACE,
  RIGHT_BRACE,
  LEFT_PAREN,
  RIGHT_PAREN,
  MINUS,
  PLUS,
  SLASH,
  STAR,

  // 1 - 3 character tokens
  BANG,
  BANG_EQUAL,
  BANG_EQUAL_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  EQUAL_EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,

  // Literals
  IDENTIFIER,
  STRING,
  NUMBER,

  // Modifiers (e.g. toString, toBool)
  MODIFIER,

  // Keywords
  TRUE,
  FALSE,
  NULL,
  UNDEFINED,
  LET,

  // Statement separator
  NEW_LINE,

  // End of string
  EOT,
} = TokenType;

export function parser(tokens: Token[], captureError: CaptureError) {
  let current = 0;

  // Grammar Symbol Helpers
  function isAtEnd() {
    return peek().type === EOT;
  }

  function advance() {
    if (!isAtEnd()) current++;
    return previous();
  }

  function check(type: TokenString) {
    if (isAtEnd()) return false;
    return peek().type === type;
  }

  function peek() {
    return tokens[current];
  }

  function previous() {
    return tokens[current - 1];
  }

  function match(...types: TokenString[]) {
    for (const type of types) {
      if (check(type)) {
        advance();
        return true;
      }
    }

    return false;
  }

  function error(token: Token, errorMessage: string) {
    captureError(token.line, errorMessage, token.lexeme);
    throw new Error(errorMessage);
  }

  function consume(type: TokenString, errorMessage: string) {
    if (check(type)) return advance();
    captureError(peek().line, errorMessage, peek().lexeme);
    throw new Error(errorMessage);
  }

  function synchronize() {
    // TODO: Make this a bit more robust
    // Skip over new lines which aren't part of a statement
    while (peek().type === NEW_LINE) advance();
  }

  // Create Binary Operator Builder
  function buildBinaryOperatorFn(matches: TokenString[], buildExpr: () => Expr) {
    return () => {
      let expr = buildExpr();

      while (match(...matches)) {
        const operator = previous();
        const right = buildExpr();
        expr = createBinary(expr, operator, right);
      }

      return expr;
    };
  }

  // Expression Grammar Symbol Builders
  function primary() {
    if (match(FALSE, TRUE, NULL, UNDEFINED, NUMBER, STRING)) {
      return createLiteral(previous());
    }

    if (match(IDENTIFIER)) return createVariable(previous());

    if (match(LEFT_PAREN)) {
      const expr = expression();
      consume(RIGHT_PAREN, "Expected a ')' after the expression.");
      return createGrouping(expr);
    }

    throw new Error('No match found');
  }

  function unary(): Expr {
    if (match(BANG, MINUS, MODIFIER)) {
      const operator = previous();
      const right = unary();
      return createUnary(operator, right);
    }

    return primary();
  }

  const factor = buildBinaryOperatorFn([SLASH, STAR], unary);
  const term = buildBinaryOperatorFn([MINUS, PLUS], factor);
  const comparison = buildBinaryOperatorFn([GREATER, GREATER_EQUAL, LESS, LESS_EQUAL], term);
  const equality = buildBinaryOperatorFn([BANG_EQUAL, BANG_EQUAL_EQUAL, EQUAL_EQUAL, EQUAL_EQUAL_EQUAL], comparison);

  function assignment(): Expr {
    const expr = equality();

    if (match(EQUAL)) {
      const equals = previous();
      const value = assignment();

      if (expr.type === 'Variable') {
        const name = expr.name;
        return createAssignment(name, value);
      }

      error(equals, 'Invalid assignment target.');
    }

    return expr;
  }

  function expression() {
    return assignment();
  }

  // Statement Grammar Symbol Builders
  function expressionStatement() {
    const expr = expression();
    !isAtEnd() && consume(NEW_LINE, 'Expect a `\n` after an expression.');
    return createExprStmt(expr);
  }

  function block() {
    const statements: Stmt[] = [];

    while (!check(RIGHT_BRACE) && !isAtEnd()) {
      const statement = declaration();
      if (statement) statements.push(statement);
    }

    consume(RIGHT_BRACE, 'Expect `}` after block.');
    return statements;
  }

  function statement() {
    if (match(LEFT_BRACE)) return createBlock(block());
    return expressionStatement();
  }

  function letDeclaration() {
    const name = consume(IDENTIFIER, 'Expect a variable name.');

    let initializer: LetDecl['initializer'];
    if (match(EQUAL)) {
      initializer = expression();
    }

    consume(NEW_LINE, 'Expect a `\n` after a variable declaration.');
    return createLetDecl(name, initializer);
  }

  function declaration() {
    try {
      if (match(LET)) return letDeclaration();

      return statement();
    } catch (error) {
      // If there's an error in the statement then skip to the next logical point
      synchronize();
      return null;
    }
  }

  function parse() {
    const statements: Stmt[] = [];

    while (!isAtEnd()) {
      // Skip adding the statement if there was an error
      const statement = declaration();
      if (statement) statements.push(statement);
    }

    return statements;
  }

  return parse();
}
