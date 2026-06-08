# Documentação de Casos de Uso — SwiftCart E-commerce
**Sprint 1 | 15/05/2026**

---

## Convenções

| Campo | Descrição |
|-------|-----------|
| **Ator** | Quem dispara o caso de uso |
| **Pré-condições** | Estado necessário antes da execução |
| **Fluxo Principal** | Sequência de passos padrão |
| **Fluxo Alternativo** | Desvios tratados pelo sistema |
| **Pós-condições** | Estado do sistema após execução |

---

## UC01 — Cadastrar Usuário

**Ator:** Visitante  
**Pré-condições:** Usuário não está autenticado.

**Fluxo Principal:**
1. Visitante acessa `/register`.
2. Preenche nome, e-mail e senha.
3. (Opcional) Informa o CEP.
4. Sistema valida os dados (Joi).
5. Sistema consulta ViaCEP com o CEP informado e preenche logradouro, bairro, cidade e UF.
6. Sistema verifica unicidade do e-mail.
7. Sistema cria hash bcrypt da senha (cost 10).
8. Sistema persiste o usuário no banco.
9. Sistema envia e-mail de boas-vindas (simulado).
10. Sistema retorna `201 Created` com dados públicos do usuário.

**Fluxos Alternativos:**
- **UC01-A1:** CEP inválido — sistema registra aviso no log e continua o cadastro sem endereço.
- **UC01-A2:** E-mail já cadastrado — sistema retorna `409 Conflict`.
- **UC01-A3:** Dados inválidos (senha fraca, e-mail malformado) — sistema retorna `400 Bad Request` com mensagem descritiva.

**Pós-condições:** Usuário criado no banco com `tipo_acesso = CLIENTE`.

---

## UC02 — Efetuar Login

**Ator:** Usuário (Cliente ou Admin)  
**Pré-condições:** Usuário cadastrado no sistema.

**Fluxo Principal:**
1. Usuário acessa `/login`.
2. Informa e-mail e senha.
3. Sistema busca usuário pelo e-mail.
4. Sistema verifica senha com bcrypt.compare().
5. Sistema gera token JWT (payload: id, email, tipoAcesso; expiração: 7 dias).
6. Sistema retorna `200 OK` com token e dados do usuário.

**Fluxos Alternativos:**
- **UC02-A1:** Credenciais inválidas — sistema retorna `401 Unauthorized` com mensagem genérica (não revela qual campo é incorreto).

**Pós-condições:** Token JWT armazenado no localStorage do cliente. Usuário redirecionado para `/`.

---

## UC03 — Editar Perfil

**Ator:** Usuário autenticado  
**Pré-condições:** Usuário autenticado com JWT válido.

**Fluxo Principal:**
1. Usuário acessa `/profile`.
2. Sistema exibe dados atuais do perfil via `GET /api/users/me`.
3. Usuário altera nome, número, complemento e/ou CEP.
4. Ao digitar CEP, sistema consulta ViaCEP e preenche campos automaticamente.
5. Usuário confirma as alterações.
6. Sistema persiste as mudanças com `PUT /api/users/me`.
7. Sistema retorna `200 OK` com dados atualizados.

**Fluxos Alternativos:**
- **UC03-A1:** CEP inválido — campos de endereço permanecem editáveis manualmente.

**Pós-condições:** Dados do usuário atualizados no banco.

---

## UC04 — Excluir Conta

**Ator:** Usuário autenticado  
**Pré-condições:** Usuário autenticado.

**Fluxo Principal:**
1. Usuário clica em "Excluir minha conta" na página de perfil.
2. Sistema exibe confirmação modal.
3. Usuário confirma.
4. Sistema exclui o registro (CASCADE deleta carrinho e wishlist).
5. Sistema invalida o token no frontend e redireciona para `/`.

**Pós-condições:** Usuário e dados associados removidos do banco.

---

## UC05 — Cadastrar Produto (Admin)

**Ator:** Administrador  
**Pré-condições:** Usuário autenticado com `tipo_acesso = ADMIN`.

**Fluxo Principal:**
1. Admin acessa `/admin/products`.
2. Preenche nome, descrição, preço, estoque, categoria e URL da imagem.
3. Sistema valida (nome obrigatório, preço > 0, estoque >= 0).
4. Sistema persiste o produto.
5. Sistema retorna `201 Created`.

**Fluxos Alternativos:**
- **UC05-A1:** Dados inválidos — `400 Bad Request`.
- **UC05-A2:** Usuário sem perfil ADMIN — `403 Forbidden`.

**Pós-condições:** Produto disponível no catálogo.

---

## UC06 — Editar Produto (Admin)

**Ator:** Administrador  
**Pré-condições:** Produto existente; usuário Admin autenticado.

**Fluxo Principal:**
1. Admin acessa `/admin/products/:id/edit`.
2. Sistema pré-preenche formulário com dados atuais.
3. Admin altera os campos desejados.
4. Sistema persiste as alterações com `PUT /api/products/:id`.
5. Sistema retorna `200 OK`.

**Pós-condições:** Produto atualizado no banco e refletido no catálogo imediatamente.

---

## UC07 — Excluir Produto (Admin)

**Ator:** Administrador  
**Pré-condições:** Produto existente; usuário Admin autenticado.

**Fluxo Principal:**
1. Admin clica em "Excluir produto" no formulário de edição.
2. Sistema exibe confirmação.
3. Admin confirma.
4. Sistema exclui o produto (CASCADE deleta itens de carrinho e wishlist associados).
5. Sistema retorna `200 OK`.

**Pós-condições:** Produto removido do banco e do catálogo.

---

## UC08 — Listar e Buscar Produtos

**Ator:** Visitante ou Usuário  
**Pré-condições:** Nenhuma.

**Fluxo Principal:**
1. Usuário acessa `/`.
2. Sistema carrega produtos com paginação (12 por página).
3. Usuário pode filtrar por categoria clicando na sidebar.
4. Usuário pode buscar por nome no campo de pesquisa.
5. Sistema exibe produtos correspondentes com nome, imagem, preço e botão "Adicionar".

**Fluxos Alternativos:**
- **UC08-A1:** Nenhum resultado — sistema exibe mensagem "Nenhum produto encontrado".

**Pós-condições:** Catálogo exibido conforme filtros aplicados.

---

## UC09 — Adicionar Produto ao Carrinho

**Ator:** Cliente autenticado  
**Pré-condições:** Usuário autenticado; produto com estoque > 0.

**Fluxo Principal:**
1. Cliente clica em "Adicionar" em um card de produto.
2. Sistema verifica autenticação.
3. Sistema verifica disponibilidade em estoque.
4. Sistema cria ou incrementa o item no carrinho (upsert).
5. Sistema retorna `201 Created` com item atualizado.
6. Frontend exibe feedback "Adicionado!" e atualiza badge do carrinho.

**Fluxos Alternativos:**
- **UC09-A1:** Visitante não autenticado — redirecionado para `/login`.
- **UC09-A2:** Produto sem estoque — sistema retorna `400` com mensagem de indisponibilidade.
- **UC09-A3:** Quantidade excede estoque — `400` com detalhe do estoque disponível.

**Pós-condições:** Item registrado em `carrinho_itens`; badge do carrinho incrementado.

---

## UC10 — Atualizar Quantidade no Carrinho

**Ator:** Cliente autenticado  
**Pré-condições:** Item existente no carrinho do usuário.

**Fluxo Principal:**
1. Cliente acessa `/cart`.
2. Clica nos botões `+` ou `−` do item.
3. Sistema valida a nova quantidade contra o estoque disponível.
4. Sistema persiste a nova quantidade.
5. Sistema exibe total atualizado.

**Fluxos Alternativos:**
- **UC10-A1:** Quantidade solicitada excede estoque — sistema ajusta para o máximo disponível e exibe aviso.

**Pós-condições:** Quantidade e total do carrinho atualizados.

---

## UC11 — Remover Item do Carrinho

**Ator:** Cliente autenticado  
**Pré-condições:** Item existente no carrinho.

**Fluxo Principal:**
1. Cliente clica em "✕" ao lado do item.
2. Sistema exclui o item do carrinho.
3. Sistema retorna `200 OK`.
4. Frontend atualiza a lista e o total.

**Pós-condições:** Item removido de `carrinho_itens`.

---

## UC12 — Criar Categoria (Admin)

**Ator:** Administrador  
**Pré-condições:** Usuário Admin autenticado.

**Fluxo Principal:**
1. Admin acessa `/admin/categories`.
2. Preenche nome da categoria.
3. Sistema gera slug automaticamente a partir do nome (se não informado).
4. Sistema verifica unicidade do nome e do slug.
5. Sistema persiste e retorna `201 Created`.

**Fluxos Alternativos:**
- **UC12-A1:** Nome ou slug duplicado — `409 Conflict`.

**Pós-condições:** Categoria disponível para associação com produtos.

---

## UC13 — Remover Categoria (Admin)

**Ator:** Administrador  
**Pré-condições:** Categoria existente; usuário Admin autenticado.

**Fluxo Principal:**
1. Admin clica em "Excluir" na linha da categoria.
2. Sistema verifica se existem produtos vinculados.
3. Nenhum produto vinculado: sistema exclui a categoria.
4. Sistema retorna `200 OK`.

**Fluxos Alternativos:**
- **UC13-A1:** Categoria com produtos vinculados — sistema retorna `409 Conflict` informando a quantidade de produtos, sem excluir.

**Pós-condições:** Categoria removida do banco (apenas quando sem produtos).

---

## UC14 — Favoritar / Desfavoritar Produto (Wishlist)

**Ator:** Cliente autenticado  
**Pré-condições:** Usuário autenticado.

**Fluxo Principal:**
1. Cliente clica no ícone "♡" em um produto.
2. Sistema verifica se o produto já está na wishlist do usuário.
3. Se não está: cria o registro → retorna `action: "added"`.
4. Se já está: remove o registro → retorna `action: "removed"`.

**Pós-condições:** Estado da wishlist alternado (toggle).

---

## UC15 — Finalizar Pedido (Checkout)

**Ator:** Cliente autenticado  
**Pré-condições:** Carrinho com ao menos um item; usuário autenticado.

**Fluxo Principal:**
1. Cliente acessa `/checkout`.
2. Sistema exibe resumo dos itens e total.
3. Cliente clica em "Confirmar Pedido".
4. Sistema revalida estoque de todos os itens.
5. Sistema calcula total final.
6. Sistema executa transação: cria registro em `pedidos`, limpa `carrinho_itens`.
7. Sistema envia confirmação por e-mail (simulado).
8. Sistema retorna `201 Created` com dados do pedido.
9. Frontend exibe tela de sucesso com número do pedido.

**Fluxos Alternativos:**
- **UC15-A1:** Carrinho vazio — `400 Bad Request` com mensagem orientativa.
- **UC15-A2:** Estoque insuficiente no momento da confirmação — `409 Conflict` identificando o produto problemático; carrinho permanece intacto.

**Pós-condições:** Pedido criado em `status = PENDENTE`; carrinho esvaziado; e-mail de confirmação disparado.
