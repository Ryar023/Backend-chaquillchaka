const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const userFields = '_id name email role isActive createdAt updatedAt';
const managedRoles = ['RECEPTION', 'ACCOUNTING', 'HR'];

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
}

async function listUsers(req, res, next) {
  try {
    const users = await User.find().select(userFields).sort({ name: 1 }).lean();
    return res.json({ data: users.map(serializeUser) });
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Revisa los datos del usuario.', errors: errors.array() });
  if (req.admin.role === 'HR' && !managedRoles.includes(req.body.role)) {
    return res.status(403).json({ message: 'Recursos Humanos solo puede crear cuentas de recepción, contabilidad o RR. HH.' });
  }

  try {
    const email = req.body.email.toLowerCase();
    if (await User.exists({ email })) return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    const user = await User.create({
      name: req.body.name,
      email,
      passwordHash: await bcrypt.hash(req.body.password, 12),
      role: req.body.role
    });
    return res.status(201).json({ message: 'Cuenta creada correctamente.', data: serializeUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    return next(error);
  }
}

async function updateUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Los datos de la cuenta no son válidos.', errors: errors.array() });
  if (req.admin.role === 'HR' && req.body.role === 'ADMIN') {
    return res.status(403).json({ message: 'Recursos Humanos no puede asignar el rol Administrador.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'No se encontró la cuenta.' });
    if (req.admin._id.equals(user._id) && req.body.role && req.body.role !== user.role) {
      return res.status(400).json({ message: 'No puedes cambiar tu propio rol.' });
    }
    if (req.admin._id.equals(user._id) && req.body.isActive === false) {
      return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta.' });
    }
    if (req.admin.role === 'HR' && user.role === 'ADMIN') {
      return res.status(403).json({ message: 'Recursos Humanos no puede modificar cuentas de Administrador.' });
    }

    const nextRole = req.body.role ?? user.role;
    const nextActive = req.body.isActive ?? user.isActive;
    if (user.role === 'ADMIN' && (nextRole !== 'ADMIN' || !nextActive)) {
      const activeAdmins = await User.countDocuments({ role: 'ADMIN', isActive: true });
      if (activeAdmins <= 1) return res.status(409).json({ message: 'Debe permanecer al menos una cuenta Administrador activa.' });
    }

    user.role = nextRole;
    user.isActive = nextActive;
    await user.save();
    return res.json({ message: 'Cuenta actualizada correctamente.', data: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listUsers, createUser, updateUser };
