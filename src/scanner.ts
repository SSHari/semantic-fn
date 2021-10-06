import { KeyWords, Token, TokenType, TokenString } from './tokens';
import { CaptureError } from './errors';

const {
  // Single character tokens
  COLON,
  COMMA,
  DOT,
  LEFT_BRACE,
  RIGHT_BRACE,
  LEFT_BRACKET,
  RIGHT_BRACKET,
  LEFT_PAREN,
  RIGHT_PAREN,
  MINUS,
  PLUS,
  SLASH,
  STAR,

  // One or two character tokens
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

  // End of string
  EOT,
} = TokenType;

export function scanner(source: string, captureError: CaptureError) {
  const tokens: Token[] = [];
  let start = 0;
  let current = 0;
  let line = 1;

  // Add a new token
  function addToken(type: TokenString, literal?: any) {
    const text = source.substring(start, current);
    tokens.push({ type, lexeme: text, literal, line });
  }

  // Traverse the source
  function isAtEnd() {
    return current >= source.length;
  }

  function advance() {
    return source.charAt(current++);
  }

  function match(expected: string) {
    if (isAtEnd()) return false;
    if (source.charAt(current) !== expected) return false;

    current++;
    return true;
  }

  function matchNext([expected, expectedNext]: string) {
    if (isAtEnd()) return false;
    if (source.charAt(current) !== expected || source.charAt(current + 1) !== expectedNext) return false;

    current += 2;
    return true;
  }

  function peek() {
    if (isAtEnd()) return '';
    return source.charAt(current);
  }

  function peekNext() {
    if (current + 1 >= source.length) return '';
    return source.charAt(current + 1);
  }

  function string(quoteType: string) {
    while (peek() !== quoteType && !isAtEnd()) {
      if (peek() === '\n') line++;
      advance();
    }

    if (isAtEnd()) captureError(line, 'Unterminated string', source.substring(start, current));

    // Step over the terminating quote
    advance();

    // Trim the quotes out
    const text = source.substring(start + 1, current - 1);
    addToken(STRING, text);
  }

  function isDigit(char: string) {
    return char >= '0' && char <= '9';
  }

  function number() {
    while (isDigit(peek())) advance();

    // Check for decimal
    if (peek() === '.' && isDigit(peekNext())) {
      // Step over the decimal
      advance();
      while (isDigit(peek())) advance();
    }

    if (peek() === '.') captureError(line, 'You can only have one `.` in a decimal number', source.substring(start, current));
    if (isAlpha(peek())) captureError(line, 'An alpha character cannot immediately follow a number', `${source.substring(start, current)}${peek()}`);

    // Convert value to a number
    addToken(NUMBER, Number(source.substring(start, current)));
  }

  function isAlpha(char: string) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
  }

  function isAlphaNumeric(char: string) {
    return isAlpha(char) || isDigit(char);
  }

  function identifier() {
    while (isAlphaNumeric(peek())) advance();

    const text = source.substring(start, current);
    const type = KeyWords.get(text) ?? IDENTIFIER;
    addToken(type);
  }

  // Handle scanning
  function scanToken() {
    const nextChar = advance();
    switch (nextChar) {
      case ':':
        addToken(COLON);
        break;
      case ',':
        addToken(COMMA);
        break;
      case '.':
        addToken(DOT);
        break;
      case '{':
        addToken(LEFT_BRACE);
        break;
      case '}':
        addToken(RIGHT_BRACE);
        break;
      case '[':
        addToken(LEFT_BRACKET);
        break;
      case ']':
        addToken(RIGHT_BRACKET);
        break;
      case '(':
        addToken(LEFT_PAREN);
        break;
      case ')':
        addToken(RIGHT_PAREN);
        break;
      case '-':
        addToken(MINUS);
        break;
      case '+':
        addToken(PLUS);
        break;
      case '*':
        addToken(STAR);
        break;
      case '/':
        addToken(SLASH);
        break;
      case '!':
        if (matchNext('==')) addToken(BANG_EQUAL_EQUAL);
        else if (match('=')) addToken(BANG_EQUAL);
        else addToken(BANG);
        break;
      case '=':
        if (matchNext('==')) addToken(EQUAL_EQUAL_EQUAL);
        else if (match('=')) addToken(EQUAL_EQUAL);
        else addToken(EQUAL);
        break;
      case '<':
        if (match('=')) addToken(LESS_EQUAL);
        else addToken(LESS);
        break;
      case '>':
        if (match('=')) addToken(GREATER_EQUAL);
        else addToken(GREATER);
        break;
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace
        break;
      case '\n':
        line++;
        break;
      case '"':
        string('"');
        break;
      case "'":
        string("'");
        break;
      default:
        if (isDigit(nextChar)) number();
        else if (isAlpha(nextChar)) identifier();
        else captureError(line, `Unknown token starting with ${nextChar}`, '');
    }
  }

  function scanTokens() {
    while (!isAtEnd()) {
      // Reset the start property after each token is added
      start = current;
      scanToken();
    }

    tokens.push({ type: EOT, line });

    return tokens;
  }

  return scanTokens();
}
