const TokenStrings = [
  // Single character tokens
  'LEFT_PAREN',
  'RIGHT_PAREN',
  'LEFT_BRACE',
  'RIGHT_BRACE',
  'MINUS',
  'PLUS',
  'SLASH',
  'STAR',

  // One or two character tokens
  'BANG',
  'BANG_EQUAL',
  'BANG_EQUAL_EQUAL',
  'EQUAL',
  'EQUAL_EQUAL',
  'GREATER',
  'GREATER_EQUAL',
  'LESS',
  'LESS_EQUAL',

  // Literals
  'ACCESSOR',
  'STRING',
  'NUMBER',

  // Conversion
  'TO_STRING',
  'TO_BOOL',

  // Keywords
  'AND',
  'OR',
  'TRUE',
  'FALSE',
  'NULL',
  'UNDEFINED',
] as const;

export type TokenString = typeof TokenStrings[number];
type TokenType = Record<TokenString, TokenString>;

export const TokenType = TokenStrings.reduce<Partial<TokenType>>((types, tokenString) => ({ ...types, [tokenString]: tokenString }), {}) as TokenType;

export const KeyWords = new Map([
  ['and', 'AND'],
  ['or', 'OR'],
  ['true', 'TRUE'],
  ['false', 'FALSE'],
  ['null', 'NULL'],
  ['undefined', 'UNDEFINED'],
  ['toString', 'TO_STRING'],
  ['toBool', 'TO_BOOL'],
]);
