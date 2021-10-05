import { Binary, Grouping, Literal, Unary, Expr } from './expressions';

type Evaluate = (expr: Expr) => any;
export type TreeWalkerFnMap = {
  Binary: (expr: Binary, evaluate: Evaluate) => any;
  Grouping: (expr: Grouping, evaluate: Evaluate) => any;
  Literal: (expr: Literal, evaluate: Evaluate) => any;
  Unary: (expr: Unary, evaluate: Evaluate) => any;
};

export function walkTree({ Binary, Grouping, Literal, Unary }: TreeWalkerFnMap, rootExpr: Expr) {
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

  try {
    return evaluate(rootExpr);
  } catch (error) {
    // TODO: Handle this error better
    console.log(error);
  }
}
