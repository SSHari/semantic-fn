import { normalizer } from '../normalizer';
import { scanner } from '../scanner';
import { TokenString } from '../tokens';

it.each`
  source                                                                     | normalizedSource
  ${'1 equal to 2'}                                                          | ${'1 === 2'}
  ${'1 not equal to 2'}                                                      | ${'1 !== 2'}
  ${'1 less than 2'}                                                         | ${'1 < 2'}
  ${'1 greater than 2'}                                                      | ${'1 > 2'}
  ${'1 less than or equal to 2'}                                             | ${'1 <= 2'}
  ${'1 greater than or equal to 2'}                                          | ${'1 >= 2'}
  ${'the string 1'}                                                          | ${'toString 1'}
  ${'the boolean 1'}                                                         | ${'toBool 1'}
  ${'1 plus 1'}                                                              | ${'1 + 1'}
  ${'1 minus 1'}                                                             | ${'1 - 1'}
  ${'1 multiply 1'}                                                          | ${'1 * 1'}
  ${'1 divide 1'}                                                            | ${'1 / 1'}
  ${'person.age equal to the string 5 or person.name.length greater than 7'} | ${'person.age === toString 5 or person.name.length > 7'}
`('should normalize `$source`', ({ source, normalizedSource }) => {
  expect(normalizer(source)).toEqual(normalizedSource);
});

it('should scan the source and return a list of tokens correctly', () => {
  function buildTokenObj(type: TokenString, lexeme: string, literal?: any, line: number = expect.any(Number)) {
    return { type, lexeme, literal, line };
  }

  const tokensOne = scanner('person.age === toString 5 + 2 + 3 or person.name.length > 7 and person.name !== "Jack"');

  expect(tokensOne).toHaveLength(16);
  expect(tokensOne).toEqual([
    buildTokenObj('ACCESSOR', 'person.age', ['person', 'age']),
    buildTokenObj('EQUAL_EQUAL', '==='),
    buildTokenObj('TO_STRING', 'toString'),
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
  ]);

  const tokensTwo = scanner(`
    (1 - 2 * 3) >= 4 / 2
    or
    toBool undefined
  `);

  expect(tokensTwo).toHaveLength(14);
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
    buildTokenObj('TO_BOOL', 'toBool', undefined, 4),
    buildTokenObj('UNDEFINED', 'undefined', undefined, 4),
  ]);
});
