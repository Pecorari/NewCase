const { validationResult, param } = require('express-validator');

const validarRequisicao = (req, res, next) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }
  next();
};

const validarId = [
  param('id').isInt({ gt: 0 }).withMessage('O parâmetro "id" deve ser um número inteiro positivo.')
];

module.exports = { validarRequisicao, validarId };
