# PizzaShop API 🍕

API para gerenciamento de restaurantes e pedidos, desenvolvida como solução backend para um sistema de delivery de pizzas. Fornece endpoints para operações CRUD, autenticação segura, métricas de negócio e integração com banco de dados relacional.

## Funcionalidades Principais

### 🛠️ Gestão de Pedidos
- Fluxo completo de pedidos (criação, aprovação, entrega, cancelamento)
- Atualização de status em tempo real
- Histórico de pedidos com filtros e paginação
- Cálculo de valores e totais

### 🔐 Autenticação
- Magic Links para login sem senha
- Controle de acesso baseado em roles (gerente/cliente)
- Proteção de rotas com JWT
- Sistema de logout seguro

### 📊 Business Intelligence
- Métricas em tempo real:
  - Receita diária/mensal
  - Pedidos ativos
  - Produtos populares
  - Taxa de cancelamento
- Relatórios periódicos

### 🏢 Gestão do Restaurante
- Cadastro de estabelecimento
- Atualização de informações
- Controle de produtos do cardápio
- Gerenciamento de equipe

## Stack Tecnológica

**Runtime:**  
[<img src="https://bun.sh/logo.svg" width="100" alt="Bun">](https://bun.sh/)

**Principais tecnologias:**
- **Bun** - Runtime JavaScript de alta performance
- **Elysia** - Framework web moderno
- **Drizzle ORM** - Interface type-safe para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **Zod** - Validação de schemas
- **Day.js** - Manipulação de datas
- **Nodemailer** - Envio de emails

## Estrutura do Projeto

```
pizzashop-api/
├── src/
│   ├── db/          # Configuração do banco de dados
│   │   ├── schema/  # Schemas do Drizzle ORM
│   │   └── ...      # Migrações e seeds
│   │
│   ├── http/        # Camada HTTP
│   │   ├── auth/    # Autenticação JWT
│   │   ├── errors/  # Handlers de erro
│   │   └── routes/  # Endpoints da API
│   │
│   └── lib/         # Utilitários
└── drizzle/         # Migrações do banco
```

## Requisitos

- Bun >= 1.0.0
- PostgreSQL >= 15
- Node.js >= 18 (apenas para dependências)

## Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/pizzashop-api.git
cd pizzashop-api

# Instalar dependências
bun install

# Configurar variáveis de ambiente (criar .env)
cp .env.example .env

# Executar migrações do banco
bun run migrate

# Popular banco com dados de teste (opcional)
bun run seed

# Iniciar servidor em modo desenvolvimento
bun run dev
```

## Variáveis de Ambiente

| Variável           | Obrigatório | Descrição                          |
|--------------------|-------------|------------------------------------|
| DATABASE_URL       | Sim         | URL de conexão do PostgreSQL       |
| API_BASE_URL       | Sim         | URL base da API                    |
| AUTH_REDIRECT_URL  | Sim         | URL para redirecionamento de login |

## Endpoints Principais

### Autenticação
- `POST /authenticate` - Envia magic link
- `GET /auth-links/authenticate` - Valida código de autenticação

### Pedidos
- `GET /orders` - Lista pedidos com filtros
- `GET /orders/:orderId` - Detalhes do pedido
- `PATCH /orders/:orderId/[action]` - Ações no pedido (approve, deliver, cancel, dispatch)

### Métricas
- `GET /metrics/day-orders-amount` - Pedidos do dia
- `GET /metrics/month-receipt` - Receita mensal
- `GET /metrics/popular-products` - Produtos mais vendidos

### Restaurante
- `POST /restaurants` - Cadastra novo restaurante
- `GET /managed-restaurant` - Dados do restaurante

## Execução em Produção

```bash
# Build do projeto
bun run build

# Iniciar em produção
bun run start
```

## Contribuição

1. Faça fork do projeto
2. Crie sua feature branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.