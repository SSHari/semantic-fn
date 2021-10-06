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

it('should return the last statement of a multi-line descriptor', () => {
  const fn = buildSemanticFn(
    `
    1 + 2
    2 + 3
    100
    `,
    {},
  );
  expect(fn()).toBe(100);
});