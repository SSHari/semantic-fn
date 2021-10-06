import { scanner } from '../scanner';
import { parser } from '../parser';
import { Expr } from '../expressions';
import { createErrorTracker } from '../errors';

it('should scan a list of tokens and return a syntax tree correctly', () => {
  function buildExprObj(expression: Partial<Expr>) {
    return expect.objectContaining({ ...expression });
  }

  const errorTracker = createErrorTracker();

  const tokensOne = scanner('age > 20', errorTracker.captureCompileError);
  const syntaxTreeOne = parser(tokensOne, errorTracker.captureCompileError);

  expect(syntaxTreeOne).toEqual(
    buildExprObj({
      type: 'Binary',
      left: buildExprObj({ type: 'Literal', token: expect.objectContaining({ lexeme: 'age' }) }),
      operator: { type: 'GREATER', line: 1, lexeme: '>' },
      right: buildExprObj({ type: 'Literal', token: expect.objectContaining({ lexeme: '20', literal: 20 }) }),
    }),
  );

  /*
  const tokensTwo = scanner('person.age === toString 5 + 2 + 3 or person.name.length > 7 and person.name !== "Jack"');
  const syntaxTreeTwo = parser(tokensTwo);
  */
});
