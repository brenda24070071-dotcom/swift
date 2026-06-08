// frontend/src/hooks/useCep.js
import { useState } from 'react';
import { viaCepService } from '../services/viaCepService';

/**
 * Hook para integração com a API ViaCEP.
 * Consulta o endereço automaticamente ao digitar um CEP válido.
 *
 * @param {Function} onSuccess - callback chamado com os dados de endereço
 * @param {Function} onError   - callback chamado com a mensagem de erro
 */
export function useCep(onSuccess, onError) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function fetchAddress(cep) {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      const msg = 'CEP deve conter 8 dígitos.';
      setError(msg);
      onError?.(msg);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const address = await viaCepService.getAddress(cleanCep);

      if (address.erro) {
        throw new Error('CEP não encontrado. Preencha o endereço manualmente.');
      }

      onSuccess?.(address);
      return address;
    } catch (err) {
      const msg = err.message || 'Erro ao consultar CEP.';
      setError(msg);
      onError?.(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { fetchAddress, loading, error };
}
