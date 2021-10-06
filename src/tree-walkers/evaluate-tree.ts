import { TokenType } from '../tokens';
import { TreeWalkerFnMap } from '../tree-walker';

const {
  BANG,
  BANG_EQUAL,
  BANG_EQUAL_EQUAL,
  EQUAL_EQUAL,
  EQUAL_EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  IDENTIFIER,
  LESS,
  LESS_EQUAL,
  MINUS,
  MODIFIER,
  PLUS,
  SLASH,
  STAR,
} = TokenType;

export function evaluateTree(argMap: Record<string, number>, ...args: any[]): TreeWalkerFnMap {
  return {
    Binary: (expr, evaluate) => {
      const left = evaluate(expr.left);
      const right = evaluate(expr.right);

      switch (expr.operator.type) {
        case BANG_EQUAL:
          return left != right;
        case BANG_EQUAL_EQUAL:
          return left !== right;
        case EQUAL_EQUAL:
          return left == right;
        case EQUAL_EQUAL_EQUAL:
          return left === right;
        case GREATER:
          return left > right;
        case GREATER_EQUAL:
          return left >= right;
        case LESS:
          return left < right;
        case LESS_EQUAL:
          return left <= right;
        case MINUS:
          return left - right;
        case PLUS:
          return left + right;
        case SLASH:
          return left / right;
        case STAR:
          return left * right;
      }

      // This should not be reachable
      return null;
    },
    Grouping: (expr, evaluate) => {
      return evaluate(expr.expression);
    },
    Literal: (expr) => {
      // TODO: Handle this correctly after scope is added
      /*
      if (expr.tokenType === ACCESSOR) {
        const [argName, ...properties] = expr.value as string[];
        return properties.reduce<any>((value, nextProperty) => value?.[nextProperty], args[argMap[argName]]);
      }
        */

      return expr.token.literal;
    },
    Unary: (expr, evaluate) => {
      const right = evaluate(expr.right);

      switch (expr.operator.type) {
        case MINUS:
          return -right;
        case BANG:
          return !right;
        case MODIFIER:
          return handleModifier(right, expr.operator.literal);
      }

      // This should not be reachable
      return null;
    },
  };
}

/* Utilities */
type Modifier = 'toString' | 'toBool';
function handleModifier(value: any, modifier: Modifier) {
  switch (modifier) {
    case 'toBool':
      return Boolean(value);
    case 'toString':
      return String(value);
    default:
      return value;
  }
}
