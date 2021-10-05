import { KeyWords, Token, TokenType, TokenString } from './tokens';

export function scanner(source: string, argMap: Record<string, any>) {
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

  function isWhiteSpace(char: string) {
    return char === ' ' || char === '\r' || char === '\t' || char === '\n';
  }

  function string(quoteType: string) {
    while (peek() !== quoteType && !isAtEnd()) {
      if (peek() === '\n') line++;
      advance();
    }

    if (isAtEnd()) console.log('Unterminated string');

    // Step over the terminating quote
    advance();

    // Trim the quotes out
    const text = source.substring(start + 1, current - 1);
    addToken(TokenType.STRING, text);
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

    // TODO: Handle other potential errors
    if (peek() === '.') console.log('You cannot have another . in a decimal');

    // Convert value to a number
    addToken(TokenType.NUMBER, Number(source.substring(start, current)));
  }

  function isAlpha(char: string) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  function identifier() {
    while (!isWhiteSpace(peek()) && !isAtEnd()) advance();

    const text = source.substring(start, current);
    const accessorParts = text.split('.');

    if (KeyWords.has(text) && KeyWords.get(text) === 'MODIFIER') {
      addToken(TokenType[KeyWords.get(text) as TokenString], text);
    } else if (KeyWords.has(text)) {
      addToken(TokenType[KeyWords.get(text) as TokenString]);
    } else if (typeof argMap[accessorParts[0]] === 'number') {
      // Verify that the accessor starts
      // with one of the defined arg names
      addToken(TokenType.ACCESSOR, accessorParts);
    } else {
      console.log('This is an identifier error');
    }
  }

  // Handle scanning
  function scanToken() {
    const nextChar = advance();
    switch (nextChar) {
      case '(':
        addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        addToken(TokenType.RIGHT_PAREN);
        break;
      case '-':
        addToken(TokenType.MINUS);
        break;
      case '+':
        addToken(TokenType.PLUS);
        break;
      case '*':
        addToken(TokenType.STAR);
        break;
      case '/':
        addToken(TokenType.SLASH);
        break;
      case '!':
        if (matchNext('==')) addToken(TokenType.BANG_EQUAL_EQUAL);
        else if (match('=')) addToken(TokenType.BANG_EQUAL);
        else addToken(TokenType.BANG);
        break;
      case '=':
        if (matchNext('==')) addToken(TokenType.EQUAL_EQUAL);
        else if (match('=')) addToken(TokenType.EQUAL);
        else console.log('Handle error for single =');
        break;
      case '<':
        if (match('=')) addToken(TokenType.LESS_EQUAL);
        else addToken(TokenType.LESS);
        break;
      case '>':
        if (match('=')) addToken(TokenType.GREATER_EQUAL);
        else addToken(TokenType.GREATER);
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
        else console.log('Handle errors better');
    }
  }

  function scanTokens() {
    while (!isAtEnd()) {
      // Reset the start property after each token is added
      start = current;
      scanToken();
    }

    tokens.push({ type: TokenType.EOT, line });

    return tokens;
  }

  return scanTokens();
}
