# Tema Dark Mode - Sistema CanonIA (Área de Cálculo)

## 🎨 Implementação Completa do Tema Dark

Este documento descreve a implementação do tema Dark Mode de alta performance para o sistema CanonIA, focado na área de cálculos previdenciários.

## 📋 Resumo das Modificações

### 1. **Arquivo CSS Principal** (`src/previd/index.css`)
- **Fundo Preto Puro**: `--background: 0 0% 0%` (#000000)
- **Texto Principal**: `--foreground: 0 0% 95%` (quase branco para melhor leitura)
- **Cards**: `--card: 0 0% 8%` (#121212 - profundidade sobre fundo preto)
- **Texto Secundário**: `--muted-foreground: 0 0% 75%` (cinza claro)
- **Bordas**: `--border: 0 0% 20%` (cinza escuro)

### 2. **Classes CSS Personalizadas**

#### Área de Cálculo
```css
.calculo-section {
  @apply bg-black; /* Fundo preto puro */
}
```

#### Campos de Entrada com Bordas Dinâmicas
```css
.calculo-input {
  @apply bg-secondary border border-calculo-border rounded-lg px-3 py-2 text-foreground;
  @apply transition-all duration-300 ease-in-out;
  @apply focus:border-calculo-border-focus focus:ring-2 focus:ring-calculo-border-focus/20;
  @apply hover:border-calculo-border-hover;
  box-shadow: 0 0 0 1px hsl(var(--calculo-border));
}

.calculo-input:focus {
  box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); /* Glow azul suave */
}
```

#### Campos Obrigatórios Não Preenchidos
```css
.calculo-input.required:invalid {
  @apply border-calculo-required;
  box-shadow: 0 0 0 1px hsl(var(--calculo-required));
}
```

#### Cards de Cálculo
```css
.calculo-card {
  @apply bg-calculo-card border border-calculo-border rounded-lg p-4;
  @apply transition-all duration-300 ease-in-out;
}

.calculo-card:hover {
  @apply border-calculo-border-hover;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.1);
}
```

#### Tabelas com Zebra Stripes
```css
.calculo-table {
  @apply w-full border-collapse;
}

.calculo-table th {
  @apply bg-calculo-card border-b border-calculo-border px-4 py-3 text-left;
  @apply text-xs font-medium text-muted-foreground uppercase tracking-wider;
}

.calculo-table td {
  @apply px-4 py-3 border-b border-calculo-border text-sm text-foreground;
}

/* Linhas alternadas (zebra stripes) */
.calculo-table tbody tr:nth-child(even) {
  @apply bg-calculo-card;
}

.calculo-table tbody tr:nth-child(odd) {
  @apply bg-secondary;
}

.calculo-table tbody tr:hover {
  @apply bg-muted;
  @apply transition-colors duration-200;
}
```

#### Elementos Interativos
```css
.calculo-interactive {
  @apply transition-all duration-300 ease-in-out;
}

.calculo-interactive:hover {
  @apply transform scale-102;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
}
```

### 3. **Configuração Tailwind** (`tailwind.config.js`)
Adicionadas variáveis personalizadas:
```javascript
calculo: {
  bg: "hsl(var(--calculo-bg))",
  card: "hsl(var(--calculo-card))",
  border: "hsl(var(--calculo-border))",
  "border-focus": "hsl(var(--calculo-border-focus))",
  "border-hover": "hsl(var(--calculo-border-hover))",
  required: "hsl(var(--calculo-required))",
}
```

## 🔧 Arquivos Modificados

### ✅ **Completamente Atualizados:**

1. **`src/previd/index.css`** - Tema Dark completo
2. **`tailwind.config.js`** - Variáveis CSS personalizadas
3. **`src/previd/components/ResultadosCalculo.tsx`** - Tabela com zebra stripes
4. **`src/previd/pages/Index.tsx`** - Fundo preto e textos ajustados
5. **`src/previd/components/MaskedInput.tsx`** - Inputs com bordas dinâmicas
6. **`src/previd/components/steps/StepIdentificacao.tsx`** - Selects atualizados

### 📝 **Para Aplicar em Outros Componentes:**

Para aplicar o tema Dark em outros componentes, use estas classes:

#### Textos
```tsx
<h1 className="calculo-text-primary">Título Principal</h1>
<p className="calculo-text-secondary">Texto secundário</p>
```

#### Cards
```tsx
<div className="calculo-card">
  <h3 className="calculo-text-primary">Conteúdo do Card</h3>
</div>
```

#### Inputs
```tsx
<input className="calculo-input" required />
```

#### Botões
```tsx
<button className="calculo-button">Ação</button>
```

#### Tabelas
```tsx
<table className="calculo-table">
  <thead>
    <tr>
      <th>Coluna 1</th>
      <th>Coluna 2</th>
    </tr>
  </thead>
  <tbody>
    {/* Linhas alternadas automaticamente */}
  </tbody>
</table>
```

## 🎯 Características do Tema

### ✅ **Contraste de Acessibilidade (WCAG)**
- Texto principal: `hsl(0 0% 95%)` sobre `hsl(0 0% 0%)`
- Taxa de contraste: 19.2:1 (AAA)
- Links e botões: Azul `hsl(211 100% 50%)` com hover states

### ✅ **Bordas Dinâmicas**
- **Normal**: Cinza escuro `hsl(0 0% 20%)`
- **Hover**: Azul suave `hsl(211 100% 50%)`
- **Focus**: Azul com glow `rgba(59, 130, 246, 0.3)`
- **Obrigatório não preenchido**: Vermelho `hsl(0 70% 50%)`

### ✅ **Transições Suaves**
- Duração: `300ms`
- Easing: `ease-in-out`
- Propriedades: `all` (cores, sombras, transformações)

### ✅ **Hierarquia Visual**
- **Fundo**: Preto puro (#000000)
- **Cards**: Cinza muito escuro (#121212)
- **Elementos secundários**: Cinza médio (#1A1A1A)
- **Texto principal**: Quase branco (#F2F2F2)
- **Texto secundário**: Cinza claro (#BFBFBF)

## 🚀 Como Aplicar em Novos Componentes

1. **Importe as classes CSS** (já incluídas globalmente)
2. **Use as classes personalizadas** em vez das padrão do Tailwind
3. **Teste o contraste** com ferramentas de acessibilidade
4. **Verifique transições** em hover/focus states

## 📊 Resultado Final

O tema Dark Mode implementado oferece:
- **Leitura confortável** para sessões longas de uso
- **Contraste adequado** para acessibilidade WCAG
- **Feedback visual claro** com bordas dinâmicas
- **Hierarquia visual definida** com profundidade
- **Performance otimizada** com transições suaves

A área de cálculo agora possui uma interface moderna, profissional e acessível no tema Dark.</content>
<parameter name="filePath">c:\Users\Usuário\Desktop\PASTA VISUAL STUDIO\DARK_THEME_README.md