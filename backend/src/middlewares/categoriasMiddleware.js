const { body } = require('express-validator');

const validarCategoria = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
];

module.exports = { validarCategoria };
