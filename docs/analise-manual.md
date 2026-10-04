# Análise Manual de Test Smells


## 1. Smells encontrados

| Smell | Linhas | Descrição | Correção sugerida |
|---|---|---|---|
| Multiplos cenários | 18-31, 33-52, 54-64 | Vários comportamentos verificados num só teste (criar + buscar; comum + admin; linha + cabeçalho) | Um cenário por teste |
| Lógica condicional | 40-51 | `for` + `if/else`: cada `expect` roda só em um ramo, e o teste pode passar sem executar o que deveria | Dois testes lineares: um para usuário comum, outro para admin |
| Exception Handling (try/catch sem falha) | 70-74 | Se a exceção não for lançada, o teste passa silenciosamente | `expect(() => ...).toThrow('O usuário deve ser maior de idade.')` |
| Teste frágil | 60-63 | Acoplado ao formato literal do relatório; qualquer mudança de formatação quebra o teste | Verificar o essencial (nome e status) sem depender do texto completo |
| Convidado misterioso | 3-7, 20-29 | Dados do usuário vêm de um objeto fora do teste, escondendo causa e efeito | Dados inline no Arrange |
| Teste ignorada | 77-79 | `test.skip` sem corpo, só com TODO | Implementar o teste do relatório vazio |
| Dado criado sem asserção | 56 | Bob é criado e nunca verificado | Verificar no relatório ou remover |
| Dependência de estado global / API só para teste | 13-16 | `db` é compartilhado entre instâncias e `_clearDB()` existe só para testes | Registrar como observação; manter o reset no `beforeEach` |

## 2. Comparação com o ESLint

### 2.1 Saída do ESLint

| Linha | Severidade | Regra | Mensagem |
|---|---|---|---|
| 44 | erro | `jest/no-conditional-expect` | Avoid calling `expect` conditionally |
| 46 | erro | `jest/no-conditional-expect` | Avoid calling `expect` conditionally |
| 49 | erro | `jest/no-conditional-expect` | Avoid calling `expect` conditionally |
| 73 | erro | `jest/no-conditional-expect` | Avoid calling `expect` conditionally |
| 77 | aviso | `jest/no-disabled-tests` | Tests should not be skipped |
| 77 | aviso | `jest/expect-expect` | Test has no assertions |

### 2.2 Smells da análise manual x detecção pelo ESLint

| Smell (análise manual) | Linhas | Detectado pelo ESLint? | Regra / observação |
|---|---|---|---|
| Lógica condicional | 40-51 | Sim (parcial) | `jest/no-conditional-expect` nas linhas 44, 46 e 49. Aponta os `expect` dentro do `if/else`, mas não o `for` em si |
| Exception Handling (try/catch sem falha) | 70-74 | Sim | `jest/no-conditional-expect` na linha 73, por causa do `expect` dentro do `catch`. Não avisa que o teste passa sem lançar exceção |
| Teste ignorado | 77-79 | Sim | `jest/no-disabled-tests` (linha 77) |
| Teste vazio, sem asserções | 77-79 | Sim | `jest/expect-expect` (linha 77). Não estava na lista manual como smell separado |
| Múltiplos cenários | 18-31, 33-52, 54-64 | Não | Nenhuma regra ativa verifica quantos cenários há em um teste |
| Teste frágil | 60-63 | Não | O ESLint não avalia acoplamento ao formato da saída |
| Convidado misterioso | 3-7, 20-29 | Não | Dados externos ao teste não são detectados |
| Dado criado sem asserção | 56 | Não | Variável não usada não é detectada, porque a chamada à função tem efeito colateral |
| Estado global / API só para teste | 13-16 | Não | Fora do alcance de regras de lint |

### 2.3 Conclusão

- O ESLint detectou 3 dos 8 smells da análise manual (lógica condicional, `try/catch` sem falha e teste ignorado) e ainda apontou um extra: o teste vazio (`jest/expect-expect`).
- Os 5 smells restantes (múltiplos cenários, teste frágil, Convidado misterioso, dado sem asserção e estado global) só foram encontrados na leitura manual. Eles dependem de interpretar a intenção do teste, o que o lint não faz.
- Os dois métodos se complementam: o lint é rápido e repetível para smells estruturais, e a análise manual cobre os smells semânticos.
- Para a etapa de refatoração, a meta de validação é `npx eslint .` sem erros nem avisos no arquivo `userService.clean.test.js`.

