import { Binary, Grouping, Literal, Unary, Expr } from './expressions';
import { ExprStmt, Stmt } from './statements';

type Evaluate = (expr: Expr) => any;
export type TreeWalkerFnMap = {
  Binary: (expr: Binary, evaluate: Evaluate) => any;
  Grouping: (expr: Grouping, evaluate: Evaluate) => any;
  Literal: (expr: Literal, evaluate: Evaluate) => any;
  Unary: (expr: Unary, evaluate: Evaluate) => any;
  ExprStmt: (expr: Expr, evaluate: Evaluate) => any;
};

export function walkTree({ Binary, Grouping, Literal, Unary, ExprStmt }: TreeWalkerFnMap, statements: Stmt[]) {
  function evaluate(expr: Expr) {
    switch (expr.type) {
      case 'Binary':
        return Binary(expr, evaluate);
      case 'Grouping':
        return Grouping(expr, evaluate);
      case 'Literal':
        return Literal(expr, evaluate);
      case 'Unary':
        return Unary(expr, evaluate);
      default:
        // TODO: Handle this correctly
        // @ts-ignore
        console.log(`The type ${expr.type} is not supported`);
    }
  }

  function execute(stmt: Stmt) {
    switch (stmt.type) {
      case 'ExprStmt':
        return ExprStmt(stmt.expr, evaluate);
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
