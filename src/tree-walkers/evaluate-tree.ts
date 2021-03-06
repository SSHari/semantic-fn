import { TokenType } from '../tokens';
import { TreeWalkerFnMap } from '../tree-walker';
import { buildEnvironment, Environment } from '../environment';
import { CaptureRuntimeError } from '../errors';

const {
  BANG,
  BANG_EQUAL,
  BANG_EQUAL_EQUAL,
  EQUAL_EQUAL,
  EQUAL_EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  MINUS,
  MODIFIER,
  PLUS,
  SLASH,
  STAR,
  AND,
  OR,
} = TokenType;

type EvaluateTree = {
  captureError: CaptureRuntimeError;
  enclosing: Environment;
};

export function evaluateTree({ captureError, enclosing }: EvaluateTree): TreeWalkerFnMap {
  // Block statements will change the execution environment
  let environment = buildEnvironment({ captureError, enclosing, readonly: false });

  // Keep track of the last retrieved variable's readonly
  // status to avoid object mutation via the set expression.
  let lastVarReadOnly: boolean;

  return {
    ArrayExpr: (expr, evaluate) => {
      return expr.values.map(evaluate);
    },
    Assignment: (expr, evaluate) => {
      const value = evaluate(expr.value);
      return environment.assign(expr.name, value);
    },
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
        case AND:
          return left && right;
        case OR:
          return left || right;
      }

      // This should not be reachable
      return null;
    },
    Get: (expr, evaluate) => {
      const object = evaluate(expr.object);

      try {
        return object[expr.name.lexeme];
      } catch {
        captureError(expr.name, 'Property does not exist.');
      }
    },
    Grouping: (expr, evaluate) => {
      return evaluate(expr.expression);
    },
    Literal: (expr) => {
      return expr.token.literal;
    },
    ObjExpr: (expr, evaluate) => {
      const obj: Record<string, any> = {};

      for (const property of expr.properties) {
        obj[property.name.lexeme] = evaluate(property.value);
      }

      return obj;
    },
    Set: (expr, evaluate) => {
      const object = evaluate(expr.object);

      if (lastVarReadOnly) {
        captureError(expr.name, 'Trying to update a readonly variable.');

        // Return the current value
        return object[expr.name.lexeme];
      } else {
        try {
          const value = evaluate(expr.value);
          object[expr.name.lexeme] = value;
          return value;
        } catch {
          captureError(expr.name, 'Property does not exist.');
        }
      }
    },
    Unary: (expr, evaluate) => {
      const right = evaluate(expr.right);

      switch (expr.operator.type) {
        case MINUS:
          return -right;
        case BANG:
          return !right;
        case MODIFIER:
          return handleModifier(right, expr.operator.lexeme);
      }

      // This should not be reachable
      return null;
    },
    Variable: (expr) => {
      const { value, readonly } = environment.get(expr.name);

      lastVarReadOnly = readonly;
      return value;
    },
    Block: (stmt, _evaluate, execute) => {
      const previous = environment;

      try {
        // Set up a new environment for the block scope
        environment = buildEnvironment({ captureError, enclosing: previous, readonly: false });

        let value: any;

        for (const statement of stmt.statements) {
          value = execute(statement);
        }

        return value;
      } finally {
        // Reset the environment after leaving the block
        environment = previous;
      }
    },
    ExprStmt: (stmt, evaluate) => {
      return evaluate(stmt.expr);
    },
    IfExprStmt: (stmt, evaluate) => {
      if (evaluate(stmt.condition)) return evaluate(stmt.thenBranch);
      else if (stmt.elseBranch) return evaluate(stmt.elseBranch);
    },
    IfStmt: (stmt, evaluate, execute) => {
      if (evaluate(stmt.condition)) return execute(stmt.thenBranch);
      else if (stmt.elseBranch) return execute(stmt.elseBranch);
    },
    LetDecl: (stmt, evaluate) => {
      const value = stmt.initializer && evaluate(stmt.initializer);
      environment.define(stmt.name.lexeme, value);
      return value;
    },
  };
}

/* Utilities */
type Modifier = 'toString' | 'toBool';
function handleModifier(value: any, modifier: string) {
  switch (modifier as Modifier) {
    case 'toBool':
      return Boolean(value);
    case 'toString':
      return String(value);
    default:
      return value;
  }
}
