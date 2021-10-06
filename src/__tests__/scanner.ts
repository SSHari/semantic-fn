import { scanner } from '../scanner';
import { TokenString } from '../tokens';
import { createErrorTracker } from '../errors';

function buildTokenObj(type: TokenString, lexeme?: string, literal?: any, line: number = expect.any(Number)) {
  return { type, lexeme, literal, line };
}

it('should scan the source and return a list of tokens correctly', () => {
  const errorTracker = createErrorTracker();
  const tokensOne = scanner(
    'person.age === toString 5 + 2 + 3 or person.name.length > 7 and person.name !== "Jack"',
    errorTracker.captureCompileError,
  );

  expect(tokensOne).toHaveLength(25);
  expect(tokensOne).toEqual([
    buildTokenObj('IDENTIFIER', 'person'),
    buildTokenObj('DOT', '.'),
    buildTokenObj('IDENTIFIER', 'age'),
    buildTokenObj('EQUAL_EQUAL_EQUAL', '==='),
    buildTokenObj('MODIFIER', 'toString'),
    buildTokenObj('NUMBER', '5', 5),
    buildTokenObj('PLUS', '+'),
    buildTokenObj('NUMBER', '2', 2),
    buildTokenObj('PLUS', '+'),
    buildTokenObj('NUMBER', '3', 3),
    buildTokenObj('OR', 'or'),
    buildTokenObj('IDENTIFIER', 'person'),
    buildTokenObj('DOT', '.'),
    buildTokenObj('IDENTIFIER', 'name'),
    buildTokenObj('DOT', '.'),
    buildTokenObj('IDENTIFIER', 'length'),
    buildTokenObj('GREATER', '>'),
    buildTokenObj('NUMBER', '7', 7),
    buildTokenObj('AND', 'and'),
    buildTokenObj('IDENTIFIER', 'person'),
    buildTokenObj('DOT', '.'),
    buildTokenObj('IDENTIFIER', 'name'),
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
    errorTracker.captureCompileError,
  );

  expect(tokensTwo).toHaveLength(19);
  expect(tokensTwo).toEqual([
    buildTokenObj('NEW_LINE', '\n', undefined, 1),
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
    buildTokenObj('NEW_LINE', '\n', undefined, 2),
    buildTokenObj('OR', 'or', undefined, 3),
    buildTokenObj('NEW_LINE', '\n', undefined, 3),
    buildTokenObj('MODIFIER', 'toBool', undefined, 4),
    buildTokenObj('UNDEFINED', 'undefined', undefined, 4),
    buildTokenObj('NEW_LINE', '\n', undefined, 4),
    buildTokenObj('EOT'),
  ]);
});

it.each`
  invalidSource  | expectedError
  ${'"a string'} | ${'Unterminated string'}
  ${'1.1.1'}     | ${'You can only have one `.` in a decimal number'}
  ${'1a'}        | ${'An alpha character cannot immediately follow a number'}
  ${'$test'}     | ${'Unknown token starting with $'}
`('should log the error `$expectedError` for $invalidSource', ({ invalidSource, expectedError }) => {
  const errorTracker = createErrorTracker();
  const captureError = jest.fn(errorTracker.captureCompileError);
  scanner(invalidSource, captureError);
  expect(captureError).toHaveBeenCalledTimes(1);
  expect(captureError).toHaveBeenCalledWith(1, expectedError, expect.any(String));
});
