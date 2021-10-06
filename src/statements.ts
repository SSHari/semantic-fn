import { Expr } from './expressions';
import { Token } from './tokens';

export type Block = { type: 'Block'; statements: Stmt[] };
export type ExprStmt = { type: 'ExprStmt'; expr: Expr };
export type LetDecl = { type: 'LetDecl'; name: Token; initializer?: Expr };

export type Stmt = Block | ExprStmt | LetDecl;

export function createBlock(statements: Stmt[]): Block {
  return { type: 'Block', statements };
}

export function createExprStmt(expr: Expr): ExprStmt {
  return { type: 'ExprStmt', expr };
}

export function createLetDecl(name: Token, initializer?: Expr): LetDecl {
  return { type: 'LetDecl', name, initializer };
}
