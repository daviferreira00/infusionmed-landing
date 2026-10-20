# InfusionMed — Landing page

Landing page da InfusionMed, Centro Especializado em Terapias Infusionais em João Pessoa – PB.

Site estático (HTML, CSS e JavaScript), sem etapa de build.

## Rodar localmente

```bash
python3 -m http.server 5173
```

Depois abra http://localhost:5173.

## Estrutura

- `index.html`: página única com todas as seções
- `assets/css/style.css`: estilos e animações
- `assets/js/main.js`: menu, links de WhatsApp, carrossel de convênios e formulário
- `assets/img/`: logo, fotos da clínica, ícones e logos dos convênios

## Configuração

- Número do WhatsApp: `WHATSAPP_NUMBER` em `assets/js/main.js`
- Convênios: itens `.logo-card` em `index.html`, com as logos em `assets/img/convenios/`
