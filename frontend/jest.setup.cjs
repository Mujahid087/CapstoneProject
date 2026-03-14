const { TextEncoder, TextDecoder } = require("util");

// Polyfill TextEncoder/TextDecoder for jsdom
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}
