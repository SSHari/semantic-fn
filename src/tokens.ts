const TokenStrings = [
  // Single character tokens
  'LEFT_PAREN',
  'RIGHT_PAREN',
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

  // Modifiers (e.g. toString, toBool)
  'MODIFIER',

  // Keywords
  'AND',
  'OR',
  'TRUE',
  'FALSE',
  'NULL',
  'UNDEFINED',

  // End of string
  'EOT',
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
  ['toString', 'MODIFIER'],
  ['toBool', 'MODIFIER'],
]);

export type Token = { type: TokenString; lexeme?: string; literal?: any; line: number };
