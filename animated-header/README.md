# Animated Sticky Header v2.0.0

Menu sticky que **inicia no footer** e **sobe suavemente para o topo** ao rolar.

## 🆕 v2.0.0 - Reescrita Completa

**BREAKING CHANGE:** Reescrito usando a arquitetura vencedora do Expanded Menu:
- ✅ Captura menu nativo do Squarespace
- ✅ Cria header customizado do zero
- ✅ 100% compatível com todos os temas
- ✅ Não depende de `#menuholder` ou `#header`

## 🚀 Instalação

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js"></script>
```

## ⚙️ Parâmetros

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `transitionDuration` | number | `400` | Duração do fade (ms) |
| `scrollDuration` | number | `800` | Duração do scroll suave (ms) |
| **`fontFamily`** | string | auto | Família da fonte (ex: `Montserrat`) |
| `fontColor` | string | `#000` | Cor do texto |
| `fontSize` | number | `16` | Tamanho da fonte (px) |
| `fontWeight` | number | `500` | Peso da fonte |
| `menuSpacing` | string | `40px` | Gap entre itens |
| `hoverOpacity` | number | `0.7` | Opacidade ao hover |
| **`bgColor`** | string | `transparent` | Cor de fundo (hex, rgba, transparent) |
| **`bgEffect`** | string | none | Efeito de fundo (`blur`) |
| **`showBorder`** | boolean | `false` | Mostrar borda |
| **`borderWidth`** | number | `1` | Largura da borda (px) |
| **`borderColor`** | string | `#000` | Cor da borda |
| **`borderPosition`** | string | `bottom` | Posição (`top`, `bottom`, `both`) |
| **`teleport`** | boolean | `true` | `true`: animated teleport (starts at bottom, moves to top on scroll). `false`: normal sticky (no animation, sticks to top naturally). |

## 💡 Exemplos

### Básico (sem parâmetros):
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js"></script>
```

### Glass Morphism (transparente com blur):
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?bgColor=transparent&bgEffect=blur&fontColor=FFFFFF&showBorder=true&borderColor=FFFFFF&borderWidth=1"></script>
```

### Header preto sólido com fonte customizada:
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?bgColor=000000&fontColor=FFFFFF&fontSize=18&fontFamily=Montserrat"></script>
```

### Header branco com borda dupla:
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?bgColor=FFFFFF&fontColor=000000&showBorder=true&borderPosition=both&borderColor=CCCCCC&borderWidth=1"></script>
```

### Semi-transparente overlay:
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?bgColor=rgba(0,0,0,0.9)&fontColor=FFFFFF&showBorder=true&borderColor=FFFFFF&borderWidth=2"></script>
```

## 🎯 Como Funciona

1. **Captura** o menu nativo do Squarespace
2. **Esconde** o header original completamente
3. **Cria** um header customizado fixo no bottom
4. **Anima** suavemente para o top ao rolar além da primeira seção
5. **Home button** faz scroll inteligente para seção 2

## 🔐 Licenciamento

Comercial - Requer licença Anavo Tech.

[Compre sua licença →](https://anavo.tech/plugins)

## 🆘 Troubleshooting

**Q: Header não aparece?**
A: Verifique o console. O plugin deve mostrar "✅ Animated Sticky Header v2.0.0 Active!"

**Q: Compatível com meu tema?**
A: Sim! v2.0.0 funciona em 100% dos temas Squarespace 7.0 e 7.1

**Q: Posso desabilitar o home button dinâmico?**
A: Sim, mas apenas via código. Será adicionado como parâmetro em v2.1.0

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
