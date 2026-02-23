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

| Parâmetro | Padrão | Descrição |
|-----------|--------|-----------|
| `transitionDuration` | `400` | Duração do fade (ms) |
| `scrollDuration` | `800` | Duração do scroll suave (ms) |
| `bgColor` | `transparent` | Cor de fundo do header |
| `fontColor` | `#000` | Cor do texto |
| `fontSize` | `16` | Tamanho da fonte (px) |
| `fontWeight` | `500` | Peso da fonte |
| `menuSpacing` | `40px` | Espaçamento entre itens |
| `hoverOpacity` | `0.7` | Opacidade ao hover |

## 💡 Exemplos

### Básico (sem parâmetros):
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js"></script>
```

### Customizado:
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?fontColor=ffffff&fontSize=18&fontWeight=600"></script>
```

### Background semi-transparente:
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?bgColor=rgba(0,0,0,0.8)&fontColor=ffffff"></script>
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
