import { ArrayExpr, Assignment, Binary, Get, Grouping, Literal, ObjExpr, Set, Unary, Variable, Expr } from './expressions';
import { Block, ExprStmt, IfExprStmt, IfStmt, LetDecl, Stmt } from './statements';

type Evaluate = (expr: Expr) => any;
type Execute = (stmt: Stmt) => any;

export type TreeWalkerFnMap = {
  // Expressions
  ArrayExpr: (expr: ArrayExpr, evaluate: Evaluate) => any;
  Assignment: (expr: Assignment, evaluate: Evaluate) => any;
  Binary: (expr: Binary, evaluate: Evaluate) => any;
  Get: (expr: Get, evaluate: Evaluate) => any;
  Grouping: (expr: Grouping, evaluate: Evaluate) => any;
  Literal: (expr: Literal, evaluate: Evaluate) => any;
  ObjExpr: (stmt: ObjExpr, evaluate: Evaluate) => any;
  Set: (expr: Set, evaluate: Evaluate) => any;
  Unary: (expr: Unary, evaluate: Evaluate) => any;
  Variable: (expr: Variable, evaluate: Evaluate) => any;

  // Statements
  Block: (stmt: Block, evaluate: Evaluate, execute: Execute) => any;
  ExprStmt: (stmt: ExprStmt, evaluate: Evaluate, execute: Execute) => any;
  IfExprStmt: (stmt: IfExprStmt, evaluate: Evaluate, execute: Execute) => any;
  IfStmt: (stmt: IfStmt, evaluate: Evaluate, execute: Execute) => any;
  LetDecl: (stmt: LetDecl, evaluate: Evaluate, execute: Execute) => any;
};

export function walkTree(
  {
    ArrayExpr,
    Assignment,
    Binary,
    Get,
    Grouping,
    Literal,
    ObjExpr,
    Set,
    Unary,
    Variable,
    Block,
    ExprStmt,
    IfExprStmt,
    IfStmt,
    LetDecl,
  }: TreeWalkerFnMap,
  statements: Stmt[],
) {
  function evaluate(expr: Expr) {
    switch (expr.type) {
      case 'ArrayExpr':
        return ArrayExpr(expr, evaluate);
      case 'Assignment':
        return Assignment(expr, evaluate);
      case 'Binary':
        return Binary(expr, evaluate);
      case 'Get':
        return Get(expr, evaluate);
      case 'Grouping':
        return Grouping(expr, evaluate);
      case 'Literal':
        return Literal(expr, evaluate);
      case 'ObjExpr':
        return ObjExpr(expr, evaluate);
      case 'Set':
        return Set(expr, evaluate);
      case 'Unary':
        return Unary(expr, evaluate);
      case 'Variable':
        return Variable(expr, evaluate);
      default:
        // TODO: Handle this correctly
        // @ts-ignore
        console.log(`The type ${expr.type} is not supported`);
    }
  }

  function execute(stmt: Stmt) {
    switch (stmt.type) {
      case 'Block':
        return Block(stmt, evaluate, execute);
      case 'ExprStmt':
        return ExprStmt(stmt, evaluate, execute);
      case 'IfExprStmt':
        return IfExprStmt(stmt, evaluate, execute);
      case 'IfStmt':
        return IfStmt(stmt, evaluate, execute);
      case 'LetDecl':
        return LetDecl(stmt, evaluate, execute);
      default:
        // TODO: Handle this correctly
        // @ts-ignore
        console.log(`The type ${stmt.type} is not supported`);
    }
  }

  try {
    let value: any;

    for (const statement of statements) {
      value = execute(statement);
    }

    return value;
  } catch (error) {
    // TODO: Handle this error better by using the runtime error handler
    console.log(error);
  }
}
