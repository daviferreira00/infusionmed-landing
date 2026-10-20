# InfusionMed — Landing page

Landing page da InfusionMed, Centro Especializado em Terapias Infusionais em João Pessoa – PB.

Site estático (HTML, CSS e JavaScript), sem etapa de build.

## Rodar localmente

```bash
python3 -m http.server 5173
```

Depois abra http://localhost:5173 (site principal) ou http://localhost:5173/experience/ (versão experimental).

## Estrutura

- `index.html`: página única com todas as seções
- `experience/index.html`: segunda landing page (rota de teste) no estilo das páginas de lançamento da Apple, com cenas fixas dirigidas pelo scroll; usa `assets/css/experience.css` e `assets/js/experience.js`
- `assets/css/style.css`: estilos e animações
- `assets/js/main.js`: menu, links de WhatsApp, carrossel de convênios e formulário
- `assets/img/`: logo, fotos da clínica, ícones e logos dos convênios

## Configuração

- Número do WhatsApp: `WHATSAPP_NUMBER` em `assets/js/main.js`
- Convênios: itens `.logo-card` em `index.html`, com as logos em `assets/img/convenios/`
