let markdownIt = require('markdown-it');

const markdown = markdownIt({
  html: true,
  breaks: true,
  linkify: true
});

module.exports = function (str) {
  return markdown.render(str);
};
