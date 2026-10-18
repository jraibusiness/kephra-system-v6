# Instalação fácil · 3 arquivos

Faça no laptop, em <https://script.google.com>, com a conta Google que vai usar o app.

## 1. Criar o projeto
1. Clique em **Novo projeto** e dê o nome **Kephra System**.
2. Abra ⚙ **Configurações do projeto** e marque **"Mostrar arquivo de manifesto appsscript.json no editor"**.

## 2. Colar os 3 arquivos
Cada arquivo do GitHub vai para um lugar diferente. Abra o arquivo no GitHub e use o botão **"Copy raw file"** (ícone de copiar, no canto superior direito do arquivo).

| Arquivo no GitHub | Onde colar no Apps Script |
|---|---|
| `Kephra.gs` | No arquivo **Code.gs**: apague **tudo** o que estiver lá (Ctrl+A, Delete) e cole. |
| `Index.html` | **＋ → HTML**, com o nome **Index** (sem ".html"). Apague tudo e cole. |
| `appsscript.json` | No arquivo **appsscript.json**: apague tudo e cole. |

⚠️ O `appsscript.json` **não** vai dentro do Code.gs. Se ele cair lá, aparece o erro `Unexpected token ':'`.

Clique em 💾 **Salvar**.

## 3. Rodar a instalação
1. No topo do editor, escolha a função **`setup`** e clique em **▶ Executar**.
2. Autorize as permissões: **Avançado → Acessar Kephra System (não seguro) → Permitir**. O aviso aparece porque o app é seu e não foi verificado pelo Google; é normal.
3. Quando terminar, o registro mostra "Kephra pronto".

## 4. IA (opcional)
Abra ⚙ **Configurações do projeto → Propriedades do script → Adicionar propriedade de script**:
- `ANTHROPIC_API_KEY` = sua chave do Claude
- `GEMINI_API_KEY` = sua chave do Gemini (opcional)

## 5. Publicar e abrir no celular
1. Clique em **Implantar → Nova implantação → ⚙ → App da Web**.
2. Escolha **Executar como: Eu** e **Quem pode acessar: Somente eu**. Depois clique em **Implantar** e copie a URL que termina em `/exec`.
3. Abra essa URL no celular e adicione à tela de início:
   - iPhone: Safari → Compartilhar → **Adicionar à Tela de Início**;
   - Android: Chrome → ⋮ → **Adicionar à tela inicial**.
