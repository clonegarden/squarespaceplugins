# Animated Sticky Header

Menu sticky animado que inicia no footer e desliza suavemente para o topo ao rolar.

## 🎯 Recursos

- ✅ Header inicia fixo no rodapé da primeira seção
- ✅ Transição suave (fade in/out) ao rolar
- ✅ Home Button dinâmico com scroll inteligente
- ✅ 100% Vanilla JavaScript
- ✅ Detecção automática de sections
- ✅ Parametrizável via URL
- ✅ Compatível Squarespace 7.0 e 7.1
- ✅ Sistema de licenciamento Anavo Tech

## 🚀 Instalação

### CDN (Recomendado)

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js"></script>
```

### Com Parâmetros

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?transitionDuration=600&visibilityThreshold=15"></script>
```

## ⚙️ Parâmetros

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `transitionDuration` | number | `400` | Duração do fade (ms) |
| `visibilityThreshold` | number | `10` | % visível para ativar Home Button |
| `scrollDuration` | number | `800` | Duração do scroll suave (ms) |
| `section1Selector` | string | auto | Seletor CSS para seção 1 |
| `section2Selector` | string | auto | Seletor CSS para seção 2 |
| `menuHolderSelector` | string | `#menuholder` | Container do menu |
| `headerSelector` | string | `#header` | Elemento header |

## 🎨 Detecção Automática de Sections

### 1. Custom Selectors (prioridade alta)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?section1Selector=section.hero&section2Selector=section.about"></script>
```

### 2. Data Attributes (prioridade média)
```html
<section data-section-id="abc123" data-anavo-role="header-section">
<section data-section-id="def456" data-anavo-role="home-section">
```

### 3. Automático (fallback)
Usa as duas primeiras `<section data-section-id>` da página.

## 🔐 Licenciamento

Comercial - Requer licença Anavo Tech.
- **30 dias** de garantia
- **Domínios licenciados:** Funcionalidade completa
- **Development:** Funciona em localhost/staging

[Compre sua licença →](https://anavo.tech/plugins)

## 🛠️ Troubleshooting

**Header não aparece:**
- Verifique se existe `#menuholder` e `#header`
- Teste com custom selectors via URL params

**Transição muito rápida:**
- Ajuste `transitionDuration` (em ms)

**Home button não funciona:**
- Certifique-se de que existe uma segunda section
- Use `data-anavo-role="home-section"`

## 📖 Documentação

- [Instalação](../docs/installation.md)
- [Customização](../docs/customization.md)
- [Licenciamento](../docs/licensing.md)
- [Changelog](CHANGELOG.md)

## 🆘 Suporte

- 📧 Email: hello@anavo.tech
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)

---

**Made with ❤️ by Anavo Tech**
