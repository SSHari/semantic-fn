import { scanner } from '../scanner';
import { parser } from '../parser';
import { Expr } from '../expressions';

it('should scan a list of tokens and return a syntax tree correctly', () => {
  function buildExprObj(expression: Partial<Expr>) {
    return expect.objectContaining({ ...expression });
  }

  // TODO: This is passing, but it's wrong because we haven't implemented or / and
  const tokensOne = scanner('person.age > 20 or person.name.length > 7', { person: 0 });
  const syntaxTreeOne = parser(tokensOne);

  expect(syntaxTreeOne).toEqual(
    buildExprObj({
      type: 'Binary',
      left: buildExprObj({ type: 'Literal' }),
      operator: { type: 'GREATER', line: 1, lexeme: '>' },
      right: buildExprObj({ type: 'Literal' }),
    }),
  );

  /*
  const tokensTwo = scanner('person.age === toString 5 + 2 + 3 or person.name.length > 7 and person.name !== "Jack"');
  const syntaxTreeTwo = parser(tokensTwo);
  */
});
