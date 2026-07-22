const { validarEmail, validarCampos } = require('../utils/validaciones');
const { test, assert, resumen } = require('./runner');

console.log('\nvalidarEmail');

test('acepta email valido', () => {
  assert(validarEmail('joaco@test.com') === true);
});

test('rechaza email sin arroba', () => {
  assert(validarEmail('joaco.com') === false);
});

test('rechaza email sin dominio', () => {
  assert(validarEmail('joaco@') === false);
});

test('rechaza email vacio', () => {
  assert(validarEmail('') === false);
});

test('rechaza email con espacios', () => {
  assert(validarEmail('joa co@test.com') === false);
});

test('acepta email con subdominios', () => {
  assert(validarEmail('joaco@mail.test.com') === true);
});

console.log('\nvalidarCampos');

test('retorna null cuando todos los campos tienen valor', () => {
  assert(validarCampos({ nombre: 'Joaco', email: 'joaco@test.com', password: '123456' }) === null);
});

test('detecta campo vacio', () => {
  assert(validarCampos({ nombre: '', email: 'joaco@test.com' }) !== null);
});

test('detecta campo con solo espacios', () => {
  assert(validarCampos({ nombre: '   ', email: 'joaco@test.com' }) !== null);
});

test('detecta campo undefined', () => {
  assert(validarCampos({ nombre: undefined, email: 'joaco@test.com' }) !== null);
});

test('el mensaje de error incluye el nombre del campo', () => {
  assert(validarCampos({ email: '' }).includes('email'));
});

resumen();