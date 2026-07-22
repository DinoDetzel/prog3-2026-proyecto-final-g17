const { User } = require('../models');
const { generarToken } = require('../middleware/auth');
const { validarEmail, validarCampos } = require('../utils/validaciones');

const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const errorCampos = validarCampos({ nombre, email, password });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    if (!validarEmail(email)) return res.status(400).json({ error: 'El email no tiene un formato válido' });

    if (password.length < 6) return res.status(400).json({ error: 'La password debe tener al menos 6 caracteres' });

    const existente = await User.findOne({ where: { email } });
    if (existente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const user = await User.create({ nombre, email, password });
    const token = generarToken(user);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const errorCampos = validarCampos({ email, password });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    if (!validarEmail(email)) return res.status(400).json({ error: 'El email no tiene un formato válido' });

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await user.validarPassword(password);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generarToken(user);

    res.json({
      message: 'Login exitoso',
      user,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

const perfil = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error en perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

module.exports = { register, login, perfil };