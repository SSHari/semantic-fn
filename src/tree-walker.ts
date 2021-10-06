import { Assignment, Binary, Grouping, Literal, Unary, Variable, Expr } from './expressions';
import { Block, ExprStmt, LetDecl, Stmt } from './statements';

type Evaluate = (expr: Expr) => any;
type Execute = (stmt: Stmt) => any;

export type TreeWalkerFnMap = {
  Assignment: (expr: Assignment, evaluate: Evaluate) => any;
  Binary: (expr: Binary, evaluate: Evaluate) => any;
  Grouping: (expr: Grouping, evaluate: Evaluate) => any;
  Literal: (expr: Literal, evaluate: Evaluate) => any;
  Unary: (expr: Unary, evaluate: Evaluate) => any;
  Variable: (expr: Variable, evaluate: Evaluate) => any;
  Block: (stmt: Block, execute: Execute) => any;
  ExprStmt: (stmt: ExprStmt, evaluate: Evaluate) => any;
  LetDecl: (stmt: LetDecl, evaluate: Evaluate) => any;
};

export function walkTree({ Assignment, Binary, Grouping, Literal, Unary, Variable, Block, ExprStmt, LetDecl }: TreeWalkerFnMap, statements: Stmt[]) {
  function evaluate(expr: Expr) {
    switch (expr.type) {
      case 'Assignment':
        return Assignment(expr, evaluate);
      case 'Binary':
        return Binary(expr, evaluate);
      case 'Grouping':
        return Grouping(expr, evaluate);
      case 'Literal':
        return Literal(expr, evaluate);
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
        return Block(stmt, execute);
      case 'ExprStmt':
        return ExprStmt(stmt, evaluate);
      case 'LetDecl':
        return LetDecl(stmt, evaluate);
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
