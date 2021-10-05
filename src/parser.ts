import { Expr, createBinary, createGrouping, createLiteral, createUnary } from './expressions';
import { Token, TokenString, TokenType } from './tokens';

export function parser(tokens: Token[]) {
  let current = 0;

  // Grammar Symbol Helpers
  function isAtEnd() {
    return peek().type === TokenType.EOT;
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

    // TODO: Handle error here based on errorMessage
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

  // Grammar Symbol Builders
  function primary() {
    if (match(TokenType.FALSE, TokenType.TRUE, TokenType.NULL, TokenType.UNDEFINED, TokenType.NUMBER, TokenType.STRING, TokenType.ACCESSOR)) {
      return createLiteral(previous());
    }

    if (match(TokenType.LEFT_PAREN)) {
      const expr = expression();
      consume(TokenType.RIGHT_PAREN, "Expected a ')' after the expression.");
      return createGrouping(expr);
    }

    // TODO: Remove this and throw an error which will be caught later
    return createLiteral(previous());
  }

  function unary(): Expr {
    if (match(TokenType.BANG, TokenType.MINUS, TokenType.MODIFIER)) {
      const operator = previous();
      const right = unary();
      return createUnary(operator, right);
    }

    return primary();
  }

  const factor = buildBinaryOperatorFn([TokenType.SLASH, TokenType.STAR], unary);
  const term = buildBinaryOperatorFn([TokenType.MINUS, TokenType.PLUS], factor);
  const comparison = buildBinaryOperatorFn([TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL], term);
  const equality = buildBinaryOperatorFn([TokenType.BANG_EQUAL, TokenType.BANG_EQUAL_EQUAL, TokenType.EQUAL, TokenType.EQUAL_EQUAL], comparison);

  function expression() {
    return equality();
  }

  function parse() {
    try {
      return expression();
    } catch (error) {
      // Handle errors correctly
      console.log(error);
      return null;
    }
  }

  return parse();
}
