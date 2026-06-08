// frontend/src/utils/validators.js
export const validators = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido.',

  senha: (v) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(v) ||
    'Senha deve ter 8+ caracteres, maiúscula, minúscula, número e caractere especial.',

  cep: (v) => /^\d{8}$/.test(v.replace(/\D/g, '')) || 'CEP deve conter 8 dígitos.',

  required: (v) => (v && String(v).trim().length > 0) || 'Campo obrigatório.',

  minLength: (n) => (v) => v.length >= n || `Mínimo ${n} caracteres.`,

  positiveNumber: (v) => (Number(v) > 0) || 'Deve ser um número positivo.',

  nonNegativeInt: (v) => (Number.isInteger(Number(v)) && Number(v) >= 0) || 'Deve ser um inteiro não negativo.',
};
