/**
 * Shiki theme and rehype plugin behind the code panel in prose.
 *
 * The panel in the design is a dark slab with a chrome bar: the language on the
 * left, the four accent dots on the right. Hand-written markup builds it with
 * the `.code` classes; this plugin wraps Shiki's `<pre>` in the same markup so a
 * fenced block in Markdown lands on the identical surface.
 */

/** Token colours, matching the --code-* custom properties in global.css. */
const KEY = '#C88FE8';
const STR = '#A5CD6B';
const NUM = '#FFB84D';
const FN = '#79B8FF';
const COM = '#8A8D94';
const TEXT = '#DEE0E4';

export const codeTheme = {
  name: 'foxe-code',
  type: 'dark',
  colors: {
    'editor.foreground': TEXT,
    'editor.background': '#1E1F21',
  },
  settings: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: COM } },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.expression',
        'entity.name.tag',
      ],
      settings: { foreground: KEY },
    },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: STR } },
    {
      scope: ['constant.numeric', 'constant.language', 'variable', 'variable.other', 'variable.parameter'],
      settings: { foreground: NUM },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call',
        'entity.name.class',
        'entity.name.type',
        'support.class',
      ],
      settings: { foreground: FN },
    },
    { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: TEXT } },
  ],
};

/** The four accent dots, as hast nodes. */
function dots() {
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['code__dots'], 'aria-hidden': 'true' },
    children: Array.from({ length: 4 }, () => ({
      type: 'element',
      tagName: 'span',
      properties: {},
      children: [],
    })),
  };
}

/**
 * Wrap every highlighted block in the `.code` panel. This runs after Astro's own
 * Shiki plugin, so the language is read off the `data-language` it writes. A
 * fence with no language gets the bar without a label.
 */
export function rehypeCodePanel() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        walk(child);
        if (child.type !== 'element' || child.tagName !== 'pre') return child;

        const classes = []
          .concat(child.properties?.class ?? child.properties?.className ?? [])
          .flatMap((c) => String(c).split(/\s+/));
        if (!classes.includes('astro-code')) return child;

        const language = child.properties?.dataLanguage ?? child.properties?.['data-language'];
        const label = !language || language === 'plaintext' ? '' : String(language).toUpperCase();

        return {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code'] },
          children: [
            {
              type: 'element',
              tagName: 'div',
              properties: { className: ['code__head'] },
              children: [
                { type: 'element', tagName: 'span', properties: {}, children: [{ type: 'text', value: label }] },
                dots(),
              ],
            },
            child,
          ],
        };
      });
    };
    walk(tree);
  };
}
