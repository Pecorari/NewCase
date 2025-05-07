const { body } = require('express-validator');
const dayjs = require('dayjs');

const validarUsuario = [
  body('nome').notEmpty().withMessage('O campo nome é obrigatório.').isLength({ max: 100 }).withMessage('O nome pode ter no máximo 100 caracteres.'),
  body('cpf').notEmpty().withMessage('O campo cpf é obrigatório.').isLength({ min: 11, max: 14 }).withMessage('O CPF deve ter entre 11 e 14 caracteres.'),
  body('telefone').notEmpty().withMessage('O campo telefone é obrigatório.').isLength({ max: 20 }).withMessage('O telefone pode ter no máximo 20 caracteres.'),
  body('data_nasc').optional({ checkFalsy: true })
    .custom((value) => {
      const dataValida = dayjs(value, 'DD/MM/YYYY', true).isValid();
      if (!dataValida) {
        throw new Error('A data de nascimento deve estar no formato válido (DD/MM/YYYY).');
      }
      return true;
    }),
  body('email').notEmpty().withMessage('O campo email é obrigatório.').isEmail().withMessage('O email deve estar em um formato válido.').isLength({ max: 100 }).withMessage('O email pode ter no máximo 100 caracteres.'),
  body('senha').notEmpty().withMessage('O campo senha é obrigatório.').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
  body('tipo').optional().isIn(['cliente', 'admin']).withMessage('O tipo deve ser "cliente" ou "admin".')
];

const validarEditUsuario = [
  body('nome').notEmpty().withMessage('O campo nome é obrigatório.').isLength({ max: 100 }).withMessage('O nome pode ter no máximo 100 caracteres.'),
  body('cpf').notEmpty().withMessage('O campo cpf é obrigatório.').isLength({ min: 11, max: 14 }).withMessage('O CPF deve ter entre 11 e 14 caracteres.'),
  body('telefone').notEmpty().withMessage('O campo telefone é obrigatório.').isLength({ max: 20 }).withMessage('O telefone pode ter no máximo 20 caracteres.'),
  body('data_nasc').optional({ checkFalsy: true })
    .custom((value) => {
      const dataValida = dayjs(value, 'DD/MM/YYYY', true).isValid();
      if (!dataValida) {
        throw new Error('A data de nascimento deve estar no formato válido (DD/MM/YYYY).');
      }
      return true;
    }),
  body('tipo').optional().isIn(['cliente', 'admin']).withMessage('O tipo deve ser "cliente" ou "admin".')
];

const validarLogin = [
  body('email').notEmpty().withMessage('O campo email é obrigatório.').isEmail().withMessage('O email fornecido não é válido.'),
  body('senha').notEmpty().withMessage('O campo senha é obrigatório.').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.')
];

const validarSenha = [
  body('novaSenha').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.')
];

module.exports = { validarUsuario, validarEditUsuario, validarLogin, validarSenha };
