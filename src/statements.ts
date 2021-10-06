import { Expr } from './expressions';

export type ExprStmt = { type: 'ExprStmt'; expr: Expr };

export type Stmt = ExprStmt;

export function createExprStmt(expr: Expr): ExprStmt {
  return { type: 'ExprStmt', expr };
}
