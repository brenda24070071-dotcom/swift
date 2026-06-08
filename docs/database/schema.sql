-- =============================================================================
-- SwiftCart E-commerce — Schema PostgreSQL
-- Gerado em: 2026-05-15
-- =============================================================================

-- Extensão para UUID (uso futuro)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── categorias ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
    id         SERIAL PRIMARY KEY,
    nome       VARCHAR(100)  NOT NULL UNIQUE,
    slug       VARCHAR(100)  NOT NULL UNIQUE,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── produtos ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS produtos (
    id           SERIAL PRIMARY KEY,
    nome         VARCHAR(255)   NOT NULL,
    descricao    TEXT,
    preco        DECIMAL(10, 2) NOT NULL CHECK (preco > 0),
    estoque      INTEGER        NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    imagem_url   VARCHAR(500),
    id_categoria INTEGER        REFERENCES categorias(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(id_categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_nome      ON produtos USING gin(to_tsvector('portuguese', nome));

-- ─── usuarios ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(150)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    senha       VARCHAR(255)  NOT NULL,
    cep         VARCHAR(8),
    logradouro  VARCHAR(255),
    numero      VARCHAR(20),
    complemento VARCHAR(100),
    bairro      VARCHAR(100),
    cidade      VARCHAR(100),
    uf          VARCHAR(2),
    tipo_acesso VARCHAR(20)   NOT NULL DEFAULT 'CLIENTE'
                              CHECK (tipo_acesso IN ('CLIENTE', 'ADMIN')),
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- ─── carrinho_itens ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carrinho_itens (
    id          SERIAL PRIMARY KEY,
    id_usuario  INTEGER NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
    id_produto  INTEGER NOT NULL REFERENCES produtos(id)  ON DELETE CASCADE,
    quantidade  INTEGER NOT NULL CHECK (quantidade >= 1),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_usuario, id_produto)
);

-- ─── wishlist ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
    id          SERIAL PRIMARY KEY,
    id_usuario  INTEGER NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
    id_produto  INTEGER NOT NULL REFERENCES produtos(id)  ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_usuario, id_produto)
);

-- ─── pedidos ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
    id          SERIAL PRIMARY KEY,
    id_usuario  INTEGER        NOT NULL REFERENCES usuarios(id),
    status      VARCHAR(20)    NOT NULL DEFAULT 'PENDENTE'
                               CHECK (status IN ('PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO')),
    total       DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_pedidos_status  ON pedidos(status);

-- ─── Trigger: atualiza updated_at automaticamente ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['categorias', 'produtos', 'usuarios', 'carrinho_itens']
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %s
             FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
            t, t
        );
    END LOOP;
END;
$$;
