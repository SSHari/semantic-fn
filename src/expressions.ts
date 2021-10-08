import { Token } from './tokens';

export type ArrayExpr = { type: 'ArrayExpr'; values: Expr[] };
export type Assignment = { type: 'Assignment'; name: Token; value: Expr };
export type Binary = { type: 'Binary'; left: Expr; operator: Token; right: Expr };
export type Get = { type: 'Get'; object: Expr; name: Token };
export type Grouping = { type: 'Grouping'; expression: Expr };
export type Literal = { type: 'Literal'; token: Token };
export type ObjExpr = { type: 'ObjExpr'; properties: { name: Token; value: Expr }[] };
export type Set = { type: 'Set'; object: Expr; name: Token; value: Expr };
export type Unary = { type: 'Unary'; operator: Token; right: Expr };
export type Variable = { type: 'Variable'; name: Token };

export type Expr = ArrayExpr | Assignment | Binary | Get | Grouping | Literal | ObjExpr | Set | Unary | Variable;

export function createArrayExpr(values: Expr[]): ArrayExpr {
  return { type: 'ArrayExpr', values };
}

export function createAssignment(name: Token, value: Expr): Assignment {
  return { type: 'Assignment', name, value };
}

export function createBinary(left: Expr, operator: Token, right: Expr): Binary {
  return { type: 'Binary', left, operator, right };
}

export function createGet(object: Expr, name: Token): Get {
  return { type: 'Get', object, name };
}

export function createGrouping(expression: Expr): Grouping {
  return { type: 'Grouping', expression };
}

export function createLiteral(token: Token): Literal {
  return { type: 'Literal', token };
}

export function createObjExpr(properties: { name: Token; value: Expr }[]): ObjExpr {
  return { type: 'ObjExpr', properties };
}

export function createSet(object: Expr, name: Token, value: Expr): Set {
  return { type: 'Set', object, name, value };
}

export function createUnary(operator: Token, right: Expr): Unary {
  return { type: 'Unary', operator, right };
}

export function createVariable(name: Token): Variable {
  return { type: 'Variable', name };
}
