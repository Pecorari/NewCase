const { body } = require('express-validator');

const validarCarrinho = [
  body('produto_id').notEmpty().withMessage('O campo produto_id é obrigatório.').isInt({ gt: 0 }).withMessage('O produto_id deve ser um número inteiro positivo.'),
  body('quantidade').notEmpty().withMessage('O campo quantidade é obrigatório.').isInt({ min: 1 }).withMessage('A quantidade deve ser no mínimo 1.')
];

module.exports = { validarCarrinho };
