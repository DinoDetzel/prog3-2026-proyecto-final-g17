const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generarToken } = require('../middleware/auth');
const { test, assert, resumen } = require('./runner');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_por_defecto';

console.log('\ngenerarToken');

test('genera un token de tipo string', () => {
  assert(typeof generarToken({ id: 1, email: 'joaco@test.com' }) === 'string');
});

test('el token tiene 3 partes separadas por punto', () => {
  assert(generarToken({ id: 1, email: 'joaco@test.com' }).split('.').length === 3);
});

test('el token contiene el id y email correctos', () => {
  const decoded = jwt.verify(generarToken({ id: 1, email: 'joaco@test.com' }), JWT_SECRET);
  assert(decoded.id === 1);
  assert(decoded.email === 'joaco@test.com');
});

test('el token expira en 24 horas', () => {
  const decoded = jwt.verify(generarToken({ id: 1, email: 'joaco@test.com' }), JWT_SECRET);
  assert(decoded.exp - decoded.iat === 86400);
});

test('el token no incluye la password', () => {
  const decoded = jwt.verify(generarToken({ id: 1, email: 'j@t.com', password: 'secreta' }), JWT_SECRET);
  assert(decoded.password === undefined);
});

console.log('\nverificacion de tokens');

test('token malformado lanza JsonWebTokenError', () => {
  try {
    jwt.verify('token.invalido.fake', JWT_SECRET);
    assert(false, 'Deberia haber lanzado error');
  } catch (error) {
    assert(error.name === 'JsonWebTokenError');
  }
});

test('token firmado con otro secret lanza error', () => {
  try {
    jwt.verify(generarToken({ id: 1, email: 'j@t.com' }), 'secret_incorrecto');
    assert(false, 'Deberia haber lanzado error');
  } catch (error) {
    assert(error.name === 'JsonWebTokenError');
  }
});

test('token expirado lanza TokenExpiredError', () => {
  const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '-1h' });
  try {
    jwt.verify(token, JWT_SECRET);
    assert(false, 'Deberia haber lanzado error');
  } catch (error) {
    assert(error.name === 'TokenExpiredError');
  }
});

console.log('\nhasheo de passwords con bcrypt');

test('el hash es distinto a la password original', async () => {
  const hash = await bcrypt.hash('123456', 10);
  assert(hash !== '123456');
});

test('valida password correcta contra el hash', async () => {
  const hash = await bcrypt.hash('123456', 10);
  assert(await bcrypt.compare('123456', hash) === true);
});

test('rechaza password incorrecta contra el hash', async () => {
  const hash = await bcrypt.hash('123456', 10);
  assert(await bcrypt.compare('incorrecta', hash) === false);
});

test('dos hashes de la misma password son distintos por el salt', async () => {
  assert(await bcrypt.hash('123456', 10) !== await bcrypt.hash('123456', 10));
});

resumen();