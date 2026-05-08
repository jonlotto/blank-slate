
# Plano: Manter apenas estilos Classico e Transparente no QR Code

## O que sera feito
Remover os estilos "Com Logo" e "Tematico" do seletor de estilos do QR Code, mantendo apenas "Classico" e "Transparente".

## Mudancas

### Arquivo: `src/components/admin/QrCodeModal.tsx`

1. **Reduzir o array STYLES** para conter apenas `classic` e `transparent`
2. **Alterar o estilo padrao** de `"logo"` para `"classic"` no `useState`
3. **Remover o import** de `customLogo` (nao sera mais usado)
4. **Remover a logica de `showLogo`** e o `imageSettings` do `QRCodeCanvas` (nenhum estilo restante usa logo)
5. **Simplificar a logica de cores**: remover as condicoes referentes a `branded`
6. **Atualizar `handleSelectSaved`** para aceitar apenas `classic` e `transparent` como estilos validos (fallback para `classic`)

### Resultado
- O modal mostrara apenas 2 botoes de estilo: "Classico" (preto e branco) e "Transparente" (QR branco sem fundo)
- Codigo mais limpo sem referencias a logo ou cores de marca
