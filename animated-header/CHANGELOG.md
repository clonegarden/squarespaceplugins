# Changelog - Animated Sticky Header

## [2.0.0] - 2026-02-23

### 🔥 BREAKING CHANGES
- **Reescrita completa** usando arquitetura Expanded Menu
- Removidos parâmetros: `section1Selector`, `section2Selector`, `menuHolderSelector`, `headerSelector`, `visibilityThreshold`
- Não depende mais de `#menuholder` ou `#header`

### ✨ Added
- Captura menu nativo do Squarespace automaticamente (6 seletores)
- Cria header customizado do zero (não usa elementos nativos)
- Sticky animation (bottom → top) com fade suave
- Dynamic home button com scroll inteligente
- 100% compatibilidade com todos os temas Squarespace
- **NEW:** Font family customizável (`fontFamily`) — usa fonte do Squarespace como fallback
- **NEW:** Background modes — sólido, transparente, blur (`bgColor`, `bgEffect`)
- **NEW:** Efeito blur via `bgEffect=blur`
- **NEW:** Bordas customizáveis (`showBorder`, `borderWidth`, `borderColor`, `borderPosition`)

### 🎯 Features
- `transitionDuration` - Duração do fade (default: 400ms)
- `scrollDuration` - Duração do scroll suave (default: 800ms)
- `fontFamily` - Família da fonte (default: herda do Squarespace)
- `fontColor` - Cor do texto (default: #000)
- `fontSize` - Tamanho da fonte (default: 16px)
- `fontWeight` - Peso da fonte (default: 500)
- `menuSpacing` - Gap entre itens (default: 40px)
- `hoverOpacity` - Opacidade hover (default: 0.7)
- `bgColor` - Cor de fundo (default: transparent)
- `bgEffect` - Efeito de fundo: `blur` (default: none)
- `showBorder` - Mostrar borda (default: false)
- `borderWidth` - Largura da borda em px (default: 1)
- `borderColor` - Cor da borda (default: #000000)
- `borderPosition` - Posição: `top`, `bottom`, `both` (default: bottom)

### 🐛 Fixed
- Compatibilidade universal (todos os temas)
- `backdrop-filter` agora só é aplicado quando `bgEffect=blur`
- Cor do texto/borda sem `#` agora é normalizada automaticamente
- Mobile responsivo (horizontal scroll)
- Accessibility (reduced motion support)

---

## [1.0.0] - 2026-02-23 - DEPRECATED

### ❌ Deprecated
- Versão inicial descontinuada
- Dependia de elementos que não existem em todos os temas

### ✨ Added
- Initial release
- Sticky header animation (footer → top)
- Smooth fade transitions
- Dynamic home button with intelligent scrolling
- Automatic section detection (3 priority levels)
- URL parameter configuration
- Anavo Tech licensing system

---

[2.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/animated-header-v2.0.0
[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/animated-header-v1.0.0
