var _document;

if (typeof document === 'undefined') {
  _document = require('jsdom').jsdom();
}
else {
  _document = document;
}

module.exports = _document;
