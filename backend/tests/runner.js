let passed = 0;
let failed = 0;
const pendientes = [];

function test(nombre, fn) {
  let resultado;
  try {
    resultado = fn();
  } catch (error) {
    console.log(`FAIL ${nombre}: ${error.message}`);
    failed++;
    return;
  }

  if (resultado instanceof Promise) {
    pendientes.push(
      resultado
        .then(() => { console.log(`OK   ${nombre}`); passed++; })
        .catch((error) => { console.log(`FAIL ${nombre}: ${error.message}`); failed++; })
    );
  } else {
    console.log(`OK   ${nombre}`);
    passed++;
  }
}

function assert(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje || 'Assertion fallida');
}

function resumen() {
  Promise.all(pendientes).then(() => {
    console.log(`\nResultado: ${passed} pasaron, ${failed} fallaron`);
    process.exit(failed > 0 ? 1 : 0);
  });
}

module.exports = { test, assert, resumen };