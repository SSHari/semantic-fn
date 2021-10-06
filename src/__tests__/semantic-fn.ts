import { buildSemanticFn } from '../semantic-fn';

/*
  ${'true'}        | ${[]} | ${{}}   | ${true}
  ${'false'}       | ${[]} | ${{}}   | ${false}
  ${'person.age > 20'}      | ${[{ age: 21 }]}              | ${{ argNames: ['person'] }}         | ${true}
  ${'person.age + 20'}      | ${[{ age: 20 }]}              | ${{ argNames: ['person'] }}         | ${40}
  ${'toBool 0'}             | ${[]}                         | ${{ argNames: [] }}                 | ${false}
  ${'toString person.age'}  | ${[{ age: 20 }]}              | ${{ argNames: ['person'] }}         | ${'20'}
  ${'name === "Jack"'}      | ${['Jack']}                   | ${{ argNames: ['name'] }}           | ${true}
  ${'age == "20"'}          | ${[20]}                       | ${{ argNames: ['age'] }}            | ${true}
  ${'person.name === name'} | ${[{ name: 'Jack' }, 'Jack']} | ${{ argNames: ['person', 'name'] }} | ${true}
  */
it.each`
  descriptor       | args  | options | expected
  ${'1 + 5 === 6'} | ${[]} | ${{}}   | ${true}
  ${'10 + 10 * 2'} | ${[]} | ${{}}   | ${30}
  ${'10 - 5 - 3'}  | ${[]} | ${{}}   | ${2}
`('should return a function that evaluates `$descriptor` correctly', ({ descriptor, args, options, expected }) => {
  const fn = buildSemanticFn(descriptor, options);
  expect(fn(...args)).toBe(expected);
});

it('should handle variables correctly and return the last statement of a multi-line descriptor', () => {
  const fn = buildSemanticFn(
    `
    let a = 1 + 2
    let b = 2 + 3
    b = 1
    a + b
    `,
    {},
  );
  expect(fn()).toBe(4);
});

it('should handle global -> function arg -> block scopes correctly', () => {
  const fn = buildSemanticFn(
    `
    let a = 1
    let b = 1
    let shadowed = 10

    {
      let a = 5
      b = a
    }

    globalArg + fnArg + a + b + shadowed
    `,
    { argNames: ['fnArg', 'shadowed'], scope: { globalArg: 100, shadowed: 500 } },
  );

  expect(fn(50, 200)).toBe(166);
});

it.each`
  statement  | descriptor       | expected
  ${'block'} | ${'{\n1 + 2\n}'} | ${3}
`("should return the value of a $statement statement if it's the last statement", ({ descriptor, expected }) => {
  const fn = buildSemanticFn(descriptor);
  expect(fn()).toBe(expected);
});
