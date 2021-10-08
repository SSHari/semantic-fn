const TokenStrings = [
  // Single character tokens
  'COLON',
  'COMMA',
  'DOT',
  'LEFT_BRACE',
  'RIGHT_BRACE',
  'LEFT_BRACKET',
  'RIGHT_BRACKET',
  'LEFT_PAREN',
  'RIGHT_PAREN',
  'MINUS',
  'PERCENT',
  'PLUS',
  'SLASH',
  'STAR',

  // 1 - 3 character tokens
  'BANG',
  'BANG_EQUAL',
  'BANG_EQUAL_EQUAL',
  'EQUAL',
  'EQUAL_EQUAL',
  'EQUAL_EQUAL_EQUAL',
  'GREATER',
  'GREATER_EQUAL',
  'LESS',
  'LESS_EQUAL',

  // Literals
  'IDENTIFIER',
  'STRING',
  'NUMBER',

  // Modifiers (e.g. toString, toBool)
  'MODIFIER',

  // Keywords
  'AND',
  'OR',
  'TRUE',
  'FALSE',
  'NULL',
  'UNDEFINED',
  'LET',
  'IF',
  'ELSE',
  'DO',

  // Statement separator
  'NEW_LINE',

  // End of string
  'EOT',
] as const;

export type TokenString = typeof TokenStrings[number];
type TokenType = { [Token in TokenString]: Token };

export const TokenType = TokenStrings.reduce<Partial<TokenType>>((types, tokenString) => ({ ...types, [tokenString]: tokenString }), {}) as TokenType;

export const KeyWords: Map<string, TokenString> = new Map([
  ['and', 'AND'],
  ['or', 'OR'],
  ['true', 'TRUE'],
  ['false', 'FALSE'],
  ['null', 'NULL'],
  ['undefined', 'UNDEFINED'],
  ['let', 'LET'],
  ['if', 'IF'],
  ['else', 'ELSE'],
  ['do', 'DO'],
  ['toString', 'MODIFIER'],
  ['toBool', 'MODIFIER'],
]);

export type Token = { type: TokenString; lexeme: string; literal?: any; line: number };
