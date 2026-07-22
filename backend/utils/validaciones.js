function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCampos(campos) {
  for (const [nombre, valor] of Object.entries(campos)) {
    if (!valor || String(valor).trim() === '') {
      return `El campo '${nombre}' es obligatorio`;
    }
  }
  return null;
}

module.exports = { validarEmail, validarCampos };