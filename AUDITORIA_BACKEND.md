# Relatório de Auditoria Técnica e Plano de Refatoração - Hungo Backend

## 📌 Sumário Executivo
Este documento consolida o diagnóstico técnico e o plano de evolução arquitetural do backend **Hungo Spring** (`br.com.halotec.hungospring`). O objetivo é elevar a qualidade da aplicação aos padrões de excelência de nível Sênior, garantindo robustez financeira, separação clara de camadas, manutenibilidade e performance.

---

## 🔍 Diagnóstico e Apuração de Problemas

### 1. 🚨 Riscos Críticos (Precisão Monetária e Segurança)
- **Precisão Financeira com `Float`:** Toda a base utilizava `Float` para cálculo de preços, totais, taxas, pagamentos e descontos. Devido à imprecisão de ponto flutuante (IEEE 754), isso gera erros acumulativos de centavos.
  - *Ação:* Migração completa para `BigDecimal` ou centavos inteiros com precisão de 2 casas decimais.
- **Senhas e Segurança:** Senhas eram armazenadas em texto puro nas entidades `Cliente` e `Funcionario` e expostas diretamente em endpoints GET.
  - *Ação Solicitada pelo Usuário:* Remoção dos campos legados de senha para posterior implementação do zero com Spring Security + JWT + BCrypt.

### 2. 🏛️ Arquitetura e Quebra de Camadas
- **Exposição de Entidades JPA em Controllers:** Quase todos os controllers recebiam e retornavam entidades de banco diretamente, provocando acoplamento do schema com a API pública e problemas de referência circular no Jackson.
- **Alto Acoplamento em `VendaService`:** Injetava 9 repositórios diretamente, ignorando os serviços de domínio (`ClienteService`, `MesaService`, `FluxoFinanceiroService`, `PagamentoComandaService`) e duplicando regras de negócio.
- **Duplicação de Regra de Negócio Crítica (`atualizarTotalVenda`):** Presente com código idêntico em `ItemPedidoService`, `PedidoService` e `VendaService`.
- **Entidades com Atributos de View (`@Transient totalBruto`):** Poluição do modelo relacional com dados calculados transitórios.

### 3. 🏷️ Tipagem e "Magic Strings"
- **Ausência de Enums:** Status de pedidos, comandas, pagamentos e tipos de atendimento eram Strings literais manipuladas com `equalsIgnoreCase`, gerando inconsistências no banco e queries JPQL frágeis.
  - *Ação:* Criação de Enums tipados (`StatusPedido`, `StatusVenda`, `StatusPagamento`, `TipoAtendimento`, `TipoTransacaoFinanceira`).

### 4. ⚡ Performance e Concorrência JPA
- **Relações `@ManyToOne` sem `FetchType.LAZY`:** Padrão EAGER do JPA gerava queries desnecessárias e risco de N+1.
- **Race Condition no Sequencial de Comandas:** Consulta de valor máximo (`findMaxNumeroComandaBetween`) suscetível a colisões em aberturas simultâneas.
- **`@PostConstruct` com Leitura Total do Banco:** Método de migração em memória executado a cada boot da aplicação.

---

## 🛠️ Plano de Implementação da Refatoração

1. **Etapa 1 - Dependências e Enums de Domínio:**
   - Adicionar `spring-boot-starter-validation` no `pom.xml`.
   - Criar pacote `entity.enums` com `StatusPedido`, `StatusVenda`, `StatusPagamento`, `TipoAtendimento`, `TipoTransacaoFinanceira`, `TipoPagamentoComanda`.
2. **Etapa 2 - Limpeza de Senha e Migração de Tipos das Entidades:**
   - Remover campos de senha de `Cliente` e `Funcionario`.
   - Migrar todos os campos de valor de `Float` para `BigDecimal`.
   - Adicionar `fetch = FetchType.LAZY` nas relações `@ManyToOne`.
3. **Etapa 3 - DTOs e Validações:**
   - Criar DTOs de Request e Response para todas as entidades com anotações de Bean Validation (`@NotNull`, `@PositiveOrZero`, `@NotBlank`, etc.).
4. **Etapa 4 - Desacoplamento e Centralização de Serviços:**
   - Centralizar o cálculo de totais em `VendaService`.
   - Fazer `VendaService` usar os serviços especializados em vez de repositórios alheios.
   - Remover migração pesada em `@PostConstruct`.
5. **Etapa 5 - Controllers e Global Exception Handler:**
   - Ajustar Controllers para trabalharem com DTOs.
   - Atualizar `GlobalExceptionHandler` para capturar `MethodArgumentNotValidException` e erros de integridade.
6. **Etapa 6 - Verificação e Validação de Compilação:**
   - Garantir build limpo e sem quebras.
