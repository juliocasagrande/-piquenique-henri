# Piquenique do Henri — Lista de presença

Site estático, mobile-first, preparado para GitHub Pages. A confirmação de presença é salva em uma planilha do Google Sheets por meio de um pequeno Google Apps Script.

## Recursos

- Identidade visual em azul, branco e dourado inspirada no convite.
- Imagem do convite integrada ao site.
- Animações de confetes, brilhos e balões.
- Contagem regressiva para 24/10/2026 às 15h.
- Formulário com nome, acompanhantes e número de crianças.
- Validação e total de pessoas calculado automaticamente.
- Layout responsivo para celular e desktop.
- Backend em Google Apps Script para gravar os dados no Google Sheets.

## Configurar a planilha

1. Crie uma planilha vazia no Google Sheets.
2. Copie o ID da planilha na URL (trecho entre `/d/` e `/edit`).
3. Abra **Extensões > Apps Script**.
4. Cole o conteúdo de `google-apps-script.gs`.
5. Substitua `COLE_AQUI_O_ID_DA_PLANILHA` pelo ID real da planilha.
6. Em **Implantar > Nova implantação**, selecione **Aplicativo da Web**.
7. Execute como você e permita acesso a **Qualquer pessoa**.
8. Copie a URL terminada em `/exec`.
9. Em `config.js`, substitua `COLE_AQUI_A_URL_DO_GOOGLE_APPS_SCRIPT` pela URL `/exec`.

## Publicar no GitHub Pages

No repositório, abra **Settings > Pages** e em **Build and deployment** selecione **Deploy from a branch**, branch `main`, pasta `/ (root)`.

## Dados gravados

A aba `Presencas` é criada automaticamente com data/hora, ID, nome, acompanhantes, crianças, total de pessoas e informações básicas da origem do envio.

## Estrutura

```text
.
├── index.html
├── styles.css
├── script.js
├── config.js
├── google-apps-script.gs
├── README.md
└── assets/
    └── convite-henri.jpeg
```
