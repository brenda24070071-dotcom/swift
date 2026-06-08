# Modelo Entidade-Relacionamento — SwiftCart

## Entidades e Atributos

### USUARIO
| Coluna      | Tipo         | Restrição         |
|-------------|--------------|-------------------|
| id          | SERIAL       | PK                |
| nome        | VARCHAR(150) | NOT NULL          |
| email       | VARCHAR(150) | NOT NULL, UNIQUE  |
| senha       | VARCHAR(255) | NOT NULL (hash)   |
| cep         | VARCHAR(8)   | —                 |
| logradouro  | VARCHAR(255) | — (via ViaCEP)    |
| numero      | VARCHAR(20)  | —                 |
| complemento | VARCHAR(100) | —                 |
| bairro      | VARCHAR(100) | — (via ViaCEP)    |
| cidade      | VARCHAR(100) | — (via ViaCEP)    |
| uf          | VARCHAR(2)   | — (via ViaCEP)    |
| tipo_acesso | VARCHAR(20)  | DEFAULT 'CLIENTE' |
| created_at  | TIMESTAMPTZ  | DEFAULT NOW()     |
| updated_at  | TIMESTAMPTZ  | DEFAULT NOW()     |

### CATEGORIA
| Coluna     | Tipo         | Restrição        |
|------------|--------------|------------------|
| id         | SERIAL       | PK               |
| nome       | VARCHAR(100) | NOT NULL, UNIQUE |
| slug       | VARCHAR(100) | NOT NULL, UNIQUE |
| created_at | TIMESTAMPTZ  | DEFAULT NOW()    |
| updated_at | TIMESTAMPTZ  | DEFAULT NOW()    |

### PRODUTO
| Coluna       | Tipo          | Restrição              |
|--------------|---------------|------------------------|
| id           | SERIAL        | PK                     |
| nome         | VARCHAR(255)  | NOT NULL               |
| descricao    | TEXT          | —                      |
| preco        | DECIMAL(10,2) | NOT NULL, CHECK > 0    |
| estoque      | INTEGER       | DEFAULT 0, CHECK >= 0  |
| imagem_url   | VARCHAR(500)  | —                      |
| id_categoria | INTEGER       | FK → CATEGORIA(id)     |
| created_at   | TIMESTAMPTZ   | DEFAULT NOW()          |
| updated_at   | TIMESTAMPTZ   | DEFAULT NOW()          |

### CARRINHO_ITEM
| Coluna     | Tipo        | Restrição                       |
|------------|-------------|---------------------------------|
| id         | SERIAL      | PK                              |
| id_usuario | INTEGER     | FK → USUARIO(id) CASCADE DELETE |
| id_produto | INTEGER     | FK → PRODUTO(id) CASCADE DELETE |
| quantidade | INTEGER     | CHECK >= 1                      |
| created_at | TIMESTAMPTZ | DEFAULT NOW()                   |
| updated_at | TIMESTAMPTZ | DEFAULT NOW()                   |
|            |             | UNIQUE(id_usuario, id_produto)  |

### WISHLIST
| Coluna     | Tipo        | Restrição                       |
|------------|-------------|---------------------------------|
| id         | SERIAL      | PK                              |
| id_usuario | INTEGER     | FK → USUARIO(id) CASCADE DELETE |
| id_produto | INTEGER     | FK → PRODUTO(id) CASCADE DELETE |
| created_at | TIMESTAMPTZ | DEFAULT NOW()                   |
|            |             | UNIQUE(id_usuario, id_produto)  |

### PEDIDO
| Coluna     | Tipo          | Restrição              |
|------------|---------------|------------------------|
| id         | SERIAL        | PK                     |
| id_usuario | INTEGER       | FK → USUARIO(id)       |
| status     | VARCHAR(20)   | DEFAULT 'PENDENTE'     |
| total      | DECIMAL(10,2) | CHECK >= 0             |
| created_at | TIMESTAMPTZ   | DEFAULT NOW()          |

---

## Relacionamentos

```
USUARIO  ||--o{ CARRINHO_ITEM : "possui"
PRODUTO  ||--o{ CARRINHO_ITEM : "contido em"

USUARIO  ||--o{ WISHLIST     : "favorita"
PRODUTO  ||--o{ WISHLIST     : "favoritado por"

USUARIO  ||--o{ PEDIDO       : "realiza"

CATEGORIA ||--o{ PRODUTO     : "classifica"
```

## Regras de Negócio Principais (Integridade)

1. **Email único**: dois usuários não podem ter o mesmo email.
2. **Slug único**: categorias têm slugs únicos para uso em URLs.
3. **Preço positivo**: `preco > 0` garantido por CHECK.
4. **Estoque não-negativo**: `estoque >= 0` garantido por CHECK.
5. **Item duplicado no carrinho**: UNIQUE(id_usuario, id_produto) — upsert soma quantidade.
6. **Wishlist sem duplicata**: UNIQUE(id_usuario, id_produto) — toggle add/remove.
7. **Cascata de exclusão**: ao excluir usuário ou produto, carrinho e wishlist são removidos (CASCADE DELETE).
8. **Endereço via ViaCEP**: campos `logradouro`, `bairro`, `cidade`, `uf` são preenchidos automaticamente via API externa.
