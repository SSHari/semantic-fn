import { Expr } from './expressions';
import { Token } from './tokens';

export type Block = { type: 'Block'; statements: Stmt[] };
export type ExprStmt = { type: 'ExprStmt'; expr: Expr };
export type IfStmt = { type: 'IfStmt'; condition: Expr; thenBranch: Stmt; elseBranch?: Stmt };
export type IfExprStmt = { type: 'IfExprStmt'; condition: Expr; thenBranch: Expr; elseBranch?: Expr };
export type LetDecl = { type: 'LetDecl'; name: Token; initializer?: Expr };

export type Stmt = Block | ExprStmt | IfExprStmt | IfStmt | LetDecl;

export function createBlock(statements: Stmt[]): Block {
  return { type: 'Block', statements };
}

export function createExprStmt(expr: Expr): ExprStmt {
  return { type: 'ExprStmt', expr };
}

export function createIfExprStmt(condition: Expr, thenBranch: Expr, elseBranch?: Expr): IfExprStmt {
  return { type: 'IfExprStmt', condition, thenBranch, elseBranch };
}

export function createIfStmt(condition: Expr, thenBranch: Stmt, elseBranch?: Stmt): IfStmt {
  return { type: 'IfStmt', condition, thenBranch, elseBranch };
}

export function createLetDecl(name: Token, initializer?: Expr): LetDecl {
  return { type: 'LetDecl', name, initializer };
}
