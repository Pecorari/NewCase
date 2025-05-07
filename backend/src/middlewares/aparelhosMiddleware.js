const { body } = require('express-validator');

const validarAparelho = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
];

module.exports = { validarAparelho };
