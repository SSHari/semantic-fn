// Text that should be replaced before the actual parsing.
// This should be ordered based on string length, so that
// longer strings are matched before shorter substrings.
type Semantics = keyof typeof semantics;
const semantics = {
  'greater than or equal to': '>=',
  'less than or equal to': '<=',
  'not equal to': '!==',
  'equal to': '===',
  'greater than': '>',
  'less than': '<',
  'the string': 'toString',
  'the boolean': 'toBool',
  plus: '+',
  minus: '-',
  multiply: '*',
  divide: '/',

  // Convert logic operations to text version
  // to match the internal implementation.
  '\\|\\|': 'or',
  '&&': 'and',
};

const normalizerRegExp = new RegExp([...Object.keys(semantics)].join('|'), 'ig');

export function normalizer(source: string) {
  const replacer = (replacement: string) => {
    // Handle this separately because the pipe (`|`)
    // operator is used for regex alternation.
    if (replacement === '||') return 'or';
    if (semantics[replacement as Semantics]) return semantics[replacement as Semantics];
    return replacement;
  };

  return source.replace(normalizerRegExp, replacer);
}
