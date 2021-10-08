import { buildSemanticFn } from '../semantic-fn';

it.each`
  descriptor                     | args                          | options                             | expected
  ${'1 + 5 === 6'}               | ${[]}                         | ${{}}                               | ${true}
  ${'10 + 10 * 2'}               | ${[]}                         | ${{}}                               | ${30}
  ${'10 - 5 - 3'}                | ${[]}                         | ${{}}                               | ${2}
  ${'true'}                      | ${[]}                         | ${{}}                               | ${true}
  ${'false'}                     | ${[]}                         | ${{}}                               | ${false}
  ${'null'}                      | ${[]}                         | ${{}}                               | ${null}
  ${'undefined'}                 | ${[]}                         | ${{}}                               | ${undefined}
  ${'toBool 0'}                  | ${[]}                         | ${{ argNames: [] }}                 | ${false}
  ${'name === "Jack"'}           | ${['Jack']}                   | ${{ argNames: ['name'] }}           | ${true}
  ${'age == "20"'}               | ${[20]}                       | ${{ argNames: ['age'] }}            | ${true}
  ${'true and "short-circuit"'}  | ${[]}                         | ${{}}                               | ${'short-circuit'}
  ${'true or "short-circuit"'}   | ${[]}                         | ${{}}                               | ${true}
  ${'false and "short-circuit"'} | ${[]}                         | ${{}}                               | ${false}
  ${'false or "short-circuit"'}  | ${[]}                         | ${{}}                               | ${'short-circuit'}
  ${'person.age > 20'}           | ${[{ age: 21 }]}              | ${{ argNames: ['person'] }}         | ${true}
  ${'person.age + 20'}           | ${[{ age: 20 }]}              | ${{ argNames: ['person'] }}         | ${40}
  ${'toString person.age'}       | ${[{ age: 20 }]}              | ${{ argNames: ['person'] }}         | ${'20'}
  ${'person.name === name'}      | ${[{ name: 'Jack' }, 'Jack']} | ${{ argNames: ['person', 'name'] }} | ${true}
  ${'person.info.age'}           | ${[{ info: { age: 100 } }]}   | ${{ argNames: ['person'] }}         | ${100}
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

it('should not allow mutation of global and function args', () => {
  const fn = buildSemanticFn(
    `
    let a = 1
    let b = a = 3
    let c = person.age = modifier = 1
    let d = modifier = person.age = 1

    a + b + c + d
    `,
    { argNames: ['person'], scope: { modifier: 4 } },
  );

  expect(fn({ age: 100 })).toBe(110);
});

it.each`
  statement                                | descriptor                               | expected
  ${'block'}                               | ${'{\n1 + 2\n}'}                         | ${3}
  ${'declaration'}                         | ${'let a = 1'}                           | ${1}
  ${'expression'}                          | ${'1 + 5'}                               | ${6}
  ${'if (true)'}                           | ${'if (true) "true" \n else "false"'}    | ${'true'}
  ${'if (false)'}                          | ${'if (false) "true" \n else "false"'}   | ${'false'}
  ${'if true, do: "true", else: "false"'}  | ${'if true, do: "true", else: "false"'}  | ${'true'}
  ${'if false, do: "true", else: "false"'} | ${'if false, do: "true", else: "false"'} | ${'false'}
  ${'if true, do: "true"'}                 | ${'if true, do: "true"'}                 | ${'true'}
  ${'if false, do: "true"'}                | ${'if false, do: "true"'}                | ${undefined}
`("should return the value of a $statement statement if it's the last statement", ({ descriptor, expected }) => {
  const fn = buildSemanticFn(descriptor);
  expect(fn()).toBe(expected);
});

it('should handle objects correctly', () => {
  const fn = buildSemanticFn(`
    let obj = %{
      a: 1,
      b: %{
        c: 3
      }
    }

    obj.b.c = 5
    obj
  `);
  expect(fn()).toEqual({ a: 1, b: { c: 5 } });
});

it('should handle arrays correctly', () => {
  const fn = buildSemanticFn(`
    let arr = [1, 1 + 2, [3, 4], %{ a: 1 }]
    arr[0] = 4
    arr[2][1] = 8
    arr[3].a = 2
    arr
  `);
  expect(fn()).toEqual([4, 3, [3, 8], { a: 2 }]);
});
