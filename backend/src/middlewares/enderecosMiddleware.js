const { body } = require('express-validator');

const validarEndereco = [
  // body('usuario_id').notEmpty().withMessage('O campo usuario_id é obrigatório.').isInt({ gt: 0 }).withMessage('O usuario_id deve ser um número inteiro positivo.'),
  body('cep').notEmpty().withMessage('O campo cep é obrigatório.').isLength({ min: 8, max: 10 }).withMessage('O cep deve ter entre 8 e 10 caracteres.'),
  body('rua').notEmpty().withMessage('O campo rua é obrigatório.').isLength({ max: 100 }).withMessage('A rua deve ter no máximo 100 caracteres.'),
  body('numero').notEmpty().withMessage('O campo número é obrigatório.').isLength({ max: 10 }).withMessage('O número deve ter no máximo 10 caracteres.'),
  body('complemento').optional({ nullable: true }).isLength({ max: 50 }).withMessage('O complemento deve ter no máximo 50 caracteres.'),
  body('bairro').notEmpty().withMessage('O campo bairro é obrigatório.').isLength({ max: 50 }).withMessage('O bairro deve ter no máximo 50 caracteres.'),
  body('cidade').notEmpty().withMessage('O campo cidade é obrigatório.').isLength({ max: 50 }).withMessage('A cidade deve ter no máximo 50 caracteres.'),
  body('estado').notEmpty().withMessage('O campo estado é obrigatório.').isLength({ min: 2, max: 2 }).withMessage('O estado deve conter exatamente 2 caracteres.')
];

module.exports = { validarEndereco };
