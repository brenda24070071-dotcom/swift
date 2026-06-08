const Joi = require('joi');

const schemas = {
  // ── Autenticação ─────────────────────────────────────────────────────────
  register: Joi.object({
    nome:  Joi.string().min(2).max(150).required().messages({
      'string.min': 'Nome deve ter ao menos 2 caracteres.',
      'any.required': 'Nome é obrigatório.',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
      'string.email': 'Informe um e-mail válido.',
      'any.required': 'E-mail é obrigatório.',
    }),
    senha: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .required()
      .messages({
        'string.min': 'Senha deve ter ao menos 8 caracteres.',
        'string.pattern.base': 'Senha deve conter maiúscula, minúscula, número e caractere especial.',
        'any.required': 'Senha é obrigatória.',
      }),
    cep: Joi.string().pattern(/^\d{8}$/).optional().messages({
      'string.pattern.base': 'CEP deve conter exatamente 8 dígitos numéricos.',
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.string().required(),
  }),

  // ── Produto ──────────────────────────────────────────────────────────────
  produto: Joi.object({
    nome:        Joi.string().min(2).max(255).required(),
    descricao:   Joi.string().max(2000).optional().allow(''),
    preco:       Joi.number().positive().precision(2).required().messages({
      'number.positive': 'Preço deve ser positivo.',
    }),
    estoque:     Joi.number().integer().min(0).required(),
    imagemUrl:   Joi.string().uri().optional().allow(''),
    idCategoria: Joi.number().integer().optional().allow(null),
  }),

  // ── Categoria ────────────────────────────────────────────────────────────
  categoria: Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    slug: Joi.string()
      .lowercase()
      .pattern(/^[a-z0-9-]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'Slug deve conter apenas letras minúsculas, números e hifens.',
      }),
  }),

  // ── Carrinho ─────────────────────────────────────────────────────────────
  carrinhoItem: Joi.object({
    idProduto:  Joi.number().integer().positive().required(),
    quantidade: Joi.number().integer().min(1).required().messages({
      'number.min': 'Quantidade deve ser ao menos 1.',
    }),
  }),
};

/**
 * Valida um objeto contra um schema Joi.
 * @param {string} schemaName - chave no objeto schemas
 * @param {object} data - dados a validar
 * @throws {Error} Erro com status 400 se a validação falhar
 */
function validate(schemaName, data) {
  const schema = schemas[schemaName];
  if (!schema) throw new Error(`Schema "${schemaName}" não encontrado.`);

  const { error } = schema.validate(data, { abortEarly: true });
  if (error) {
    throw Object.assign(new Error(error.details[0].message), { status: 400 });
  }
}

module.exports = { validate, schemas };
