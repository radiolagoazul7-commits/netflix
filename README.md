# Netflix Clone - Painel de Administração

## 🎯 Acesso Rápido

### Entrar no Painel Admin
**URL:** `admin-login.html`

**Credenciais Padrão:**
- **Usuário:** `admin`
- **Senha:** `12345`

---

## 📋 Funcionalidades do Admin

### 1. **Dashboard**
- Visualização rápida de estatísticas
- Total de filmes, categorias e usuários
- Histórico de atividades recentes
- Atalhos rápidos para ações comuns

### 2. **Gerenciar Filmes e Séries**
- ➕ Adicionar novo filme/série
- ✏️ Editar informações do filme
- 🗑️ Deletar filmes
- Visualizar em tabela com detalhes

**Campos editáveis:**
- Título
- Ano de lançamento
- Avaliação (0-10)
- Gênero
- Duração
- Descrição
- URL da imagem

### 3. **Gerenciar Categorias**
- ➕ Criar novas categorias
- ✏️ Editar nomes e cores
- 🗑️ Deletar categorias
- Visualizar em grid com preview de cores

### 4. **Gerenciar Usuários**
- ➕ Adicionar novos usuários
- ✏️ Editar informações de usuários
- 🗑️ Deletar usuários
- Atribuir papéis (Usuário/Administrador)
- Visualizar data de cadastro

### 5. **Configurações**
- **Configurações do Site**
  - Nome do site
  - Descrição
  - Itens por página

- **Backup e Dados**
  - 📥 Exportar dados (JSON)
  - 📤 Importar dados de backup
  - 🗑️ Limpar todos os dados (irreversível)

---

## 💾 Armazenamento de Dados

Todos os dados são armazenados no **localStorage** do navegador:
- `adminMovies` - Lista de filmes
- `adminCategories` - Lista de categorias
- `adminUsers` - Lista de usuários
- `adminActivity` - Histórico de atividades
- `siteSettings` - Configurações gerais

**Vantagem:** Sem necessidade de servidor
**Observação:** Dados são perdidos se limpar cache/histórico do navegador

---

## 🔐 Segurança

⚠️ **NOTA:** Este é um painel de demonstração. Para produção, implemente:
- Autenticação real (backend)
- Hash de senhas
- Tokens JWT
- Validação de permissões no servidor
- HTTPS

---

## 📊 Recursos Extras

✅ **Interface Responsiva** - Funciona em desktop, tablet e mobile
✅ **Tema Dark** - Design moderno estilo Netflix
✅ **Animações Suaves** - Transições elegantes
✅ **Histórico de Atividades** - Rastreie suas ações
✅ **Exportar/Importar** - Faça backup completo dos dados
✅ **Validações** - Campos obrigatórios e verificações

---

## 🚀 Como Usar

### Acesso ao Admin
1. Abra `admin-login.html` em seu navegador
2. Use as credenciais padrão (admin / 12345)
3. Clique em "Entrar"

### Adicionar um Filme
1. Navegue para "Filmes e Séries"
2. Clique em "Novo Filme"
3. Preencha os campos obrigatórios (*)
4. Clique em "Salvar Filme"

### Editar um Filme
1. Na tabela de filmes, clique no ícone de edição (lápis)
2. Modifique os dados desejados
3. Clique em "Salvar Filme"

### Deletar um Filme
1. Na tabela, clique no ícone de lixeira
2. Confirme a exclusão

### Fazer Backup
1. Vá para "Configurações"
2. Clique em "Exportar Dados"
3. Um arquivo JSON será baixado com todos os dados

### Restaurar Backup
1. Vá para "Configurações"
2. Clique em "Importar Dados"
3. Selecione o arquivo JSON do backup
4. Os dados serão restaurados automaticamente

---

## 🎨 Customização

### Mudar Cores
Edite as variáveis CSS em `admin-style.css`:
```css
:root {
    --primary-color: #e50914;    /* Vermelho Netflix */
    --danger-color: #ff6b6b;     /* Vermelho escuro */
    --success-color: #51cf66;    /* Verde */
}
```

### Adicionar Novos Campos
1. Edite `admin-dashboard.html` (form do modal)
2. Atualize `admin-script.js` (salvar/carregar dados)
3. Atualize `script.js` (exibir no front-end)

---

## 📝 Arquivos do Projeto

```
bingo-online/
├── index.html              # Site principal (Netflix)
├── style.css              # Estilos do site
├── script.js              # Lógica do site
├── admin-login.html       # Login do admin
├── admin-dashboard.html   # Painel admin
├── admin-style.css        # Estilos do admin
├── admin-script.js        # Lógica do admin
└── README.md             # Este arquivo
```

---

## 🐛 Troubleshooting

**Não consigo fazer login:**
- Verifique se digitou "admin" e "12345" corretamente
- Limpe o cache do navegador

**Dados desapareceram:**
- Os dados são armazenados no localStorage
- Se você limpou o histórico/cache, os dados foram perdidos
- Use um backup anterior para restaurar

**Imagens não carregam:**
- Verifique se a URL da imagem está correta
- Tente usar HTTPS para URLs remotas
- Use imagens locais se necessário

---

## 📈 Próximos Passos

Para melhorar ainda mais seu painel admin:

1. **Backend com Banco de Dados**
   - Node.js + Express
   - MongoDB ou PostgreSQL
   - Autenticação real

2. **Mais Campos**
   - Elenco
   - Diretor
   - País de origem
   - Legendas disponíveis

3. **Analytics**
   - Gráficos de visualizações
   - Filmes mais assistidos
   - Estatísticas de usuários

4. **Moderação**
   - Sistema de comentários
   - Avaliações dos usuários
   - Reportar conteúdo

---

## 📞 Suporte

Qualquer dúvida? Consulte a documentação ou acesse o painel admin.

**Desenvolvido com ❤️**
