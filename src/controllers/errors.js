import { ValidationError, ForeignKeyConstraintError } from 'sequelize';

// Traduce errores de Sequelize a respuestas HTTP
export function handleError(res, error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ message: 'Datos inválidos', details: error.errors.map((e) => e.message) });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(400).json({ message: 'La relación indicada no existe' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Error interno', error: error.message });
}

// Devuelve el ID numérico del parámetro o responde 400
export function parseId(req, res, name = 'id') {
  const id = Number(req.params[name]);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: 'ID inválido' });
    return null;
  }
  return id;
}
