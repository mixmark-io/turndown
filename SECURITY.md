# Security Policy

## Supported Versions

| Version | Supported          | Remark |
| ------- | ------------------ | -------|
| 7.0.x   | :white_check_mark: | |
| < 7.0   | :x:                | jsdom |

## DOM Parser Notice

Turndown input is
* either a string that is passed to a DOM parser
* or an `HTMLElement` referring to an already built DOM tree

When a string input is passed, the DOM parser is picked as follows.
* For web browser usage, the corresponding native web parser is used, which is typically `DOMImplementation`.
* For standalone usage, custom [domino](https://github.com/mixmark-io/domino) parser is used.

Please note that a malicious string input can cause undesired effects within the DOM parser
even before Turndown code starts processing the document itself.
These effects especially include script execution and downloading external resources.

For critical applications with untrusted inputs, you should consider either cleaning up 
the input with a dedicated HTML sanitizer library or using an alternate DOM parser that
better suits your security needs.

In particular, Turndown version 6 and below used [jsdom](https://github.com/jsdom/jsdom) as the
standalone DOM parser. As `jsdom` is a fully featured DOM parser with script execution support,
it imposes an inherent security risk. We recommend upgrading to version 7, which uses custom
[domino](https://github.com/mixmark-io/domino) that doesn't even support executing scripts nor
downloading external resources.

## Reporting a Vulnerability

If you've found a vulnerability, please report it to disclosure@orchitech.cz and we'll get back to you.
