import { Token } from './tokens';

export type Assignment = { type: 'Assignment'; name: Token; value: Expr };
export type Binary = { type: 'Binary'; left: Expr; operator: Token; right: Expr };
export type Grouping = { type: 'Grouping'; expression: Expr };
export type Literal = { type: 'Literal'; token: Token };
export type Unary = { type: 'Unary'; operator: Token; right: Expr };
export type Variable = { type: 'Variable'; name: Token };

export type Expr = Assignment | Binary | Grouping | Literal | Unary | Variable;

export function createAssignment(name: Token, value: Expr): Assignment {
  return { type: 'Assignment', name, value };
}

export function createBinary(left: Expr, operator: Token, right: Expr): Binary {
  return { type: 'Binary', left, operator, right };
}

export function createGrouping(expression: Expr): Grouping {
  return { type: 'Grouping', expression };
}

export function createLiteral(token: Token): Literal {
  return { type: 'Literal', token };
}

export function createUnary(operator: Token, right: Expr): Unary {
  return { type: 'Unary', operator, right };
}

export function createVariable(name: Token): Variable {
  return { type: 'Variable', name };
}
