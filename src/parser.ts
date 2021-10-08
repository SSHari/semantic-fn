import {
  Expr,
  createAssignment,
  createBinary,
  createGet,
  createGrouping,
  createLiteral,
  createObjExpr,
  createSet,
  createUnary,
  createVariable,
} from './expressions';
import { Stmt, LetDecl, createBlock, createExprStmt, createIfExprStmt, createIfStmt, createLetDecl } from './statements';
import { Token, TokenString, TokenType } from './tokens';
import { CaptureError } from './errors';

const {
  // Single character tokens
  COLON,
  COMMA,
  DOT,
  LEFT_BRACE,
  RIGHT_BRACE,
  LEFT_PAREN,
  RIGHT_PAREN,
  MINUS,
  PERCENT,
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
  IF,
  ELSE,
  DO,
  OR,
  AND,

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
    advance();

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
  function object() {
    consume(LEFT_BRACE, 'Expect `{` to start object');
    const properties: { name: Token; value: Expr }[] = [];

    while (!check(RIGHT_BRACE) && !isAtEnd()) {
      while (check(NEW_LINE)) advance();

      const name = consume(IDENTIFIER, 'Expected a property name.');
      consume(COLON, 'Expected a `:` after a property name.');
      const value = expression();
      properties.push({ name, value });

      while (check(NEW_LINE)) advance();
      if (!check(RIGHT_BRACE)) consume(COMMA, 'Expect `,` between object properties.');
    }

    consume(RIGHT_BRACE, 'Expect `}` after object.');
    return createObjExpr(properties);
  }

  function primary() {
    if (match(FALSE)) return createLiteral({ ...previous(), literal: false });
    if (match(TRUE)) return createLiteral({ ...previous(), literal: true });
    if (match(NULL)) return createLiteral({ ...previous(), literal: null });
    if (match(UNDEFINED)) return createLiteral({ ...previous(), literal: undefined });
    if (match(NUMBER, STRING)) return createLiteral(previous());
    if (match(IDENTIFIER)) return createVariable(previous());
    if (match(PERCENT)) return object();

    if (match(LEFT_PAREN)) {
      const expr = expression();
      consume(RIGHT_PAREN, "Expected a ')' after the expression.");
      return createGrouping(expr);
    }

    throw new Error('No match found');
  }

  function get() {
    let expr: Expr = primary();

    while (true) {
      if (match(DOT)) {
        const name = consume(IDENTIFIER, 'Expect a property name after `.`.');
        expr = createGet(expr, name);
      } else {
        break;
      }
    }

    return expr;
  }

  function unary(): Expr {
    if (match(BANG, MINUS, MODIFIER)) {
      const operator = previous();
      const right = unary();
      return createUnary(operator, right);
    }

    return get();
  }

  const factor = buildBinaryOperatorFn([SLASH, STAR], unary);
  const term = buildBinaryOperatorFn([MINUS, PLUS], factor);
  const comparison = buildBinaryOperatorFn([GREATER, GREATER_EQUAL, LESS, LESS_EQUAL], term);
  const equality = buildBinaryOperatorFn([BANG_EQUAL, BANG_EQUAL_EQUAL, EQUAL_EQUAL, EQUAL_EQUAL_EQUAL], comparison);
  const and = buildBinaryOperatorFn([AND], equality);
  const or = buildBinaryOperatorFn([OR], and);

  function assignment(): Expr {
    const expr = or();

    if (match(EQUAL)) {
      const equals = previous();
      const value = assignment();

      if (expr.type === 'Variable') return createAssignment(expr.name, value);
      else if (expr.type === 'Get') return createSet(expr.object, expr.name, value);

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
    !isAtEnd() && consume(NEW_LINE, 'Expect a `\\n` after an expression.');
    return createExprStmt(expr);
  }

  function block() {
    const statements: Stmt[] = [];

    while (!check(RIGHT_BRACE) && !isAtEnd()) {
      const statement = declaration();
      if (statement) statements.push(statement);
    }

    consume(RIGHT_BRACE, 'Expect `}` after block.');
    return createBlock(statements);
  }

  // Handle single line if / else statements
  // if check, do: true, else: false
  function ifExpressionStatement() {
    const condition = expression();
    consume(COMMA, 'Expect `,` after if condition.');
    consume(DO, 'Expect `do` after if expression condition.');
    consume(COLON, 'Expect `:` after do.');

    const thenBranch = expression();
    let elseBranch: Expr | undefined;
    if (match(COMMA)) {
      consume(ELSE, 'Expect `do` after if statement else clause.');
      consume(COLON, 'Expect `:` after else.');
      elseBranch = expression();
    }

    !isAtEnd() && consume(NEW_LINE, 'Expect `\\n` after if expression statement.');

    return createIfExprStmt(condition, thenBranch, elseBranch);
  }

  function ifStatement(): Stmt {
    consume(LEFT_PAREN, 'Expect `(` after if.');
    const condition = expression();
    consume(RIGHT_PAREN, 'Expect `)` after if condition.');

    const thenBranch = statement();
    let elseBranch: Stmt | undefined;
    if (match(ELSE)) {
      elseBranch = statement();
    }

    return createIfStmt(condition, thenBranch, elseBranch);
  }

  function statement() {
    if (match(LEFT_BRACE)) return block();
    if (match(IF)) return check(LEFT_PAREN) ? ifStatement() : ifExpressionStatement();
    return expressionStatement();
  }

  function letDeclaration() {
    const name = consume(IDENTIFIER, 'Expect a variable name.');

    let initializer: LetDecl['initializer'];
    if (match(EQUAL)) {
      initializer = expression();
    }

    !isAtEnd() && consume(NEW_LINE, 'Expect a `\n` after a variable declaration.');
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
