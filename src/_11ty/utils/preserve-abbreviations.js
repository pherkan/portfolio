const { Element, Text, isText } = require('domhandler');
const { parseDocument } = require('htmlparser2');
const render = require('dom-serializer').default;

const SKIP_TAGS = new Set([
  'code',
  'pre',
  'script',
  'style',
  'svg',
  'textarea',
  'title',
]);

const ABBREVIATION_PATTERN = /(^|[^\p{L}\p{N}])([A-Z][A-Z0-9]{1,}(?:[+./-][A-Z0-9]+)*|[0-9]+[A-Z][A-Z0-9]*)(?=$|[^\p{L}\p{N}])/gu;

function hasClass(node, className) {
  return Boolean(
    node &&
      node.attribs &&
      typeof node.attribs.class === 'string' &&
      node.attribs.class.split(/\s+/).includes(className),
  );
}

function shouldSkipNode(node) {
  let current = node.parent;

  while (current) {
    if (current.name && SKIP_TAGS.has(current.name)) return true;
    if (hasClass(current, 'casing-abbr')) return true;
    current = current.parent;
  }

  return false;
}

function splitTextByAbbreviations(text) {
  const nodes = [];
  let lastIndex = 0;

  text.replace(ABBREVIATION_PATTERN, (match, prefix, abbreviation, offset) => {
    const prefixLength = prefix.length;
    const abbreviationStart = offset + prefixLength;

    if (abbreviationStart > lastIndex) {
      nodes.push(new Text(text.slice(lastIndex, abbreviationStart)));
    }

    const abbrText = new Text(abbreviation);
    const abbrElement = new Element('span', { class: 'casing-abbr' }, [abbrText]);
    abbrText.parent = abbrElement;
    nodes.push(abbrElement);

    lastIndex = abbreviationStart + abbreviation.length;
    return match;
  });

  if (lastIndex === 0) return null;

  if (lastIndex < text.length) {
    nodes.push(new Text(text.slice(lastIndex)));
  }

  return nodes;
}

function walk(node) {
  if (!node.children) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (isText(child) && !shouldSkipNode(child)) {
      const replacementNodes = splitTextByAbbreviations(child.data);

      if (replacementNodes) {
        replacementNodes.forEach((replacementNode) => {
          replacementNode.parent = node;
        });
        node.children.splice(index, 1, ...replacementNodes);
        index += replacementNodes.length - 1;
      }

      continue;
    }

    walk(child);
  }
}

module.exports = function preserveAbbreviations(content, outputPath) {
  if (!outputPath || !outputPath.endsWith('.html')) return content;
  if (typeof content !== 'string' || !content.includes('<html')) return content;

  const document = parseDocument(content, {
    decodeEntities: false,
    lowerCaseAttributeNames: false,
    lowerCaseTags: false,
  });

  walk(document);

  return render(document, { decodeEntities: false });
};
