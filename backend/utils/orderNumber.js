const crypto = require('crypto');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function createOrderNumber() {
  let body = '';
  for (let i = 0; i < 8; i += 1) {
    body += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return `EC${body}`;
}

module.exports = {
  ALPHABET,
  createOrderNumber
};
