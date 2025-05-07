const { body } = require('express-validator');

const validarProduto = [
  body('nome').notEmpty().withMessage('O nome é obrigatório.').isLength({ max: 100 }).withMessage('O nome pode ter no máximo 100 caracteres.'),
  body('aparelho_id').notEmpty().withMessage('O aparelho_id é obrigatório.').isInt().withMessage('O aparelho_id deve ser um número inteiro.'),
  body('cor').optional({ nullable: true }).isLength({ max: 50 }).withMessage('A cor pode ter no máximo 50 caracteres.'),
  body('descricao').optional({ nullable: true }).isString().withMessage('A descrição deve ser um texto.'),
  body('preco').notEmpty().withMessage('O preço é obrigatório.').isDecimal({ decimal_digits: '0,2' }).withMessage('Preço deve ser um número decimal válido (ex: 99.99).'),
  body('categoria_id').notEmpty().withMessage('O categoria_id é obrigatório.').isInt().withMessage('O categoria_id deve ser um número inteiro.'),
  body('estoque').optional().isInt({ min: 0 }).withMessage('O estoque deve ser um número inteiro positivo.'),
  body('ativo').optional().isBoolean().withMessage('O campo ativo deve ser true ou false.')
];

module.exports = { validarProduto };
