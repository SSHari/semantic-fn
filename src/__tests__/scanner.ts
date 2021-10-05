import { scanner } from '../scanner';
import { TokenString } from '../tokens';

function buildTokenObj(type: TokenString, lexeme?: string, literal?: any, line: number = expect.any(Number)) {
  return { type, lexeme, literal, line };
}

it('should scan the source and return a list of tokens correctly', () => {
  const tokensOne = scanner('person.age === toString 5 + 2 + 3 or person.name.length > 7 and person.name !== "Jack"', { person: 0 });

  expect(tokensOne).toHaveLength(17);
  expect(tokensOne).toEqual([
    buildTokenObj('ACCESSOR', 'person.age', ['person', 'age']),
    buildTokenObj('EQUAL_EQUAL', '==='),
    buildTokenObj('MODIFIER', 'toString', 'toString'),
    buildTokenObj('NUMBER', '5', 5),
    buildTokenObj('PLUS', '+'),
    buildTokenObj('NUMBER', '2', 2),
    buildTokenObj('PLUS', '+'),
    buildTokenObj('NUMBER', '3', 3),
    buildTokenObj('OR', 'or'),
    buildTokenObj('ACCESSOR', 'person.name.length', ['person', 'name', 'length']),
    buildTokenObj('GREATER', '>'),
    buildTokenObj('NUMBER', '7', 7),
    buildTokenObj('AND', 'and'),
    buildTokenObj('ACCESSOR', 'person.name', ['person', 'name']),
    buildTokenObj('BANG_EQUAL_EQUAL', '!=='),
    buildTokenObj('STRING', '"Jack"', 'Jack'),
    buildTokenObj('EOT'),
  ]);

  const tokensTwo = scanner(
    `
    (1 - 2 * 3) >= 4 / 2
    or
    toBool undefined
  `,
    {},
  );

  expect(tokensTwo).toHaveLength(15);
  expect(tokensTwo).toEqual([
    buildTokenObj('LEFT_PAREN', '(', undefined, 2),
    buildTokenObj('NUMBER', '1', 1, 2),
    buildTokenObj('MINUS', '-', undefined, 2),
    buildTokenObj('NUMBER', '2', 2, 2),
    buildTokenObj('STAR', '*', undefined, 2),
    buildTokenObj('NUMBER', '3', 3, 2),
    buildTokenObj('RIGHT_PAREN', ')', undefined, 2),
    buildTokenObj('GREATER_EQUAL', '>=', undefined, 2),
    buildTokenObj('NUMBER', '4', 4, 2),
    buildTokenObj('SLASH', '/', undefined, 2),
    buildTokenObj('NUMBER', '2', 2, 2),
    buildTokenObj('OR', 'or', undefined, 3),
    buildTokenObj('MODIFIER', 'toBool', 'toBool', 4),
    buildTokenObj('UNDEFINED', 'undefined', undefined, 4),
    buildTokenObj('EOT'),
  ]);
});
