const { body } = require('express-validator');

const validarPedido = [
  // Validação dos dados do pedido
  body('dataPedido.total').notEmpty().withMessage('Total é obrigatório').isDecimal({ decimal_digits: '0,2' }).withMessage('Total deve ser um número decimal'),

  // Validação dos itens do pedido
  body('itens').isArray({ min: 1 }).withMessage('Itens devem ser informados'),
  body('itens.*.produto_id').notEmpty().withMessage('Produto é obrigatório').isInt().withMessage('Produto deve ser um número inteiro'),
  body('itens.*.quantidade').notEmpty().withMessage('Quantidade é obrigatória').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que 0'),
  body('itens.*.preco_unitario').notEmpty().withMessage('Preço unitário é obrigatório').isDecimal({ decimal_digits: '0,2' }).withMessage('Preço unitário deve ser decimal'),
];

module.exports = { validarPedido };
