import { Expr, createBinary, createGrouping, createLiteral, createUnary } from './expressions';
import { Stmt, createExprStmt } from './statements';
import { Token, TokenString, TokenType } from './tokens';
import { CaptureError } from './errors';

const {
  // Single character tokens
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

  function consume(type: TokenString, errorMessage: string) {
    if (check(type)) return advance();
    captureError(peek().line, errorMessage, peek().lexeme ?? '');
    throw new Error(errorMessage);
  }

  function synchronize() {
    // TODO: Make this a bit more robust
    advance();
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
    if (match(FALSE, TRUE, NULL, UNDEFINED, NUMBER, STRING, IDENTIFIER)) {
      return createLiteral(previous());
    }

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

  function expression() {
    return equality();
  }

  // Statement Grammar Symbol Builders
  function statement() {
    return expressionStatement();
  }

  function expressionStatement() {
    const expr = expression();
    !isAtEnd() && consume(NEW_LINE, 'Expect a \\n after an expression.');
    return createExprStmt(expr);
  }

  function parse() {
    const statements: Stmt[] = [];

    while (!isAtEnd()) {
      // Skip over new lines which aren't part of a statement
      while (peek().type === NEW_LINE) advance();
      statements.push(statement());
    }

    return statements;
  }

  return parse();
}
