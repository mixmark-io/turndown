export default function OptionsValidator () {
  var _this = this
  this.validOptions = {}
  var validOptions = [
    ['headingStyle', ['setext', 'atx']],
    ['hr', /([*-_] *){3,}/, 'needs to be a sequence of three of more characters matching -, _, or *, each followed optionally by any number of spaces, e.g. * * *'],
    ['bulletListMarker', ['*', '-', '+']],
    ['codeBlockStyle', ['indented', 'fenced']],
    ['fence', ['```', `~~~`]],
    ['emDelimiter', ['_', '*']],
    ['strongDelimiter', ['__', '**']],
    ['linkStyle', ['inlined', 'referenced']],
    ['linkReferenceStyle', ['full', 'collapsed', 'shortcut']],
    ['br', ['  ', '\\']]
  ]

  validOptions.forEach(function (validOption) {
    _this.validOptions[validOption[0]] = (
      ValidOption.apply(null, validOption)
    )
  })
}

OptionsValidator.prototype = {
  validate: function (options) {
    var messages = []
    for (var key in options) {
      var result = this.validOptions[key].validate(options[key])
      if (result !== true) messages.push(result)
    }
    if (messages.length) throw new Error('\n - ' + messages.join('\n - '))
    return
  }
}

function ValidOption (name, values, customMessage) {
  if (!(this instanceof ValidOption)) {
    return new ValidOption(name, values, customMessage)
  }

  this.name = name
  this.values = values
  this.message = this.name + ' ' + (
    customMessage || 'needs to be either: ' + toSentence(this.values)
  )
}

ValidOption.prototype = {
  validate: function (value) {
    return this.isValid(value) ? true : this.message
  },

  isValid: function (value) {
    if (Array.isArray(this.values)) {
      return this.values.indexOf(value) > -1
    } else if (this.values instanceof RegExp) {
      return this.values.test(value)
    } else {
      throw new Error('Valid')
    }
  }
}

function toSentence (array) {
  var sentence = array[0]
  var length = array.length
  var lastWordConnector = (length === 2) ? ' or ' : ', or '

  for (var i = 1; i < length; i++) {
    var item = array[i]
    if (i === length - 1) sentence = sentence + lastWordConnector + item
    else sentence = sentence + ', ' + item
  }
  return sentence
}
