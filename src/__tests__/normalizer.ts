import { normalizer } from '../normalizer';

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
