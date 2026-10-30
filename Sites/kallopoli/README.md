# Kallopoli — Escuta & Cuidado

Painel administrativo demonstrativo feito com HTML5, CSS3 e JavaScript puro, inspirado na imagem de referência fornecida.

## Como abrir
1. Extraia o arquivo ZIP.
2. Abra a pasta `kallopoli`.
3. Clique duas vezes em `index.html` para abrir no navegador.

Não é necessário instalar dependências, executar npm ou configurar backend.

## Funcionalidades
- Navegação entre Visão geral, Colaboradores, Alertas, Acompanhamento da jornada, Indicadores, Configurações, Relatos salvos, Acompanhamento, Regras de atendimento e Exemplos.
- Layout responsivo e menu lateral recolhível em telas pequenas.
- Tema claro/escuro com preferência salva no navegador.
- Relatos fictícios com detalhes, observações e atualização de status.
- Busca e filtros nas telas de Acompanhamento, Colaboradores e Alertas.
- Adicionar e excluir regras demonstrativas.
- Modais acessíveis por teclado e mensagens de feedback.
- Persistência local por `localStorage`.

## Importante
Esta é uma interface de demonstração. Os nomes e relatos são fictícios. Não há autenticação real, integração com WhatsApp, envio de mensagens ou backend. Os dados alterados ficam apenas no `localStorage` do navegador local.

## Estrutura
```text
kallopoli/
├── index.html              Estrutura da página
├── css/
│   ├── base.css            Cores (tema claro/escuro), reset e acessibilidade
│   ├── layout.css          Barra superior, menu lateral, área de trabalho, rodapé
│   ├── components.css      Botões, campos, painéis, etiquetas, tabelas, modal, toasts
│   ├── pages.css           Estilos específicos de cada página
│   └── responsive.css      Ajustes para tablet e celular (carregar por último)
├── js/
│   └── script.js           Dados, páginas, modais, tema e eventos (índice no topo do arquivo)
├── assets/
│   └── icons/
│       └── kallopoli-mark.svg
└── README.md
```

## Onde mexer para...
| Quero mudar...                         | Arquivo                                  |
|----------------------------------------|------------------------------------------|
| Uma cor ou o tema escuro               | `css/base.css` (variáveis no topo)       |
| O menu lateral ou a barra superior     | `css/layout.css`                         |
| Aparência de botões, tabelas, modal    | `css/components.css`                     |
| O visual de uma página específica      | `css/pages.css`                          |
| Como a tela se comporta no celular     | `css/responsive.css`                     |
| Textos e dados fictícios               | `js/script.js`, seção "Dados de demonstração" |
| O que cada página mostra               | `js/script.js`, seções 7 e 8             |

> A ordem dos `<link>` no `index.html` é importante: os arquivos CSS se complementam na ordem em que são carregados.
