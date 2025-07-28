# 🔐 Sistema de Autenticação - BVOLT

## 📋 Visão Geral

O sistema de autenticação do BVOLT garante que apenas usuários autorizados tenham acesso ao sistema, proporcionando segurança e controle de acesso baseado em perfis.

## 🚪 Processo de Login

### 📝 Como Fazer Login

1. **Acesse a página inicial** do sistema BVOLT
2. **Digite seu email** no campo "Email"
3. **Digite sua senha** no campo "Senha"
4. **Clique em "Entrar"** para acessar o sistema

### 👥 Credenciais Padrão (Demonstração)

#### 🔑 Administrador
- **Email**: admin@bvolt.com
- **Senha**: 123456
- **Acesso**: Completo a todas as funcionalidades

#### 👨‍💻 Gerente
- **Email**: gerente@bvolt.com
- **Senha**: 123456
- **Acesso**: Gestão operacional e relatórios

#### 👨‍💼 Vendedor
- **Email**: vendedor@bvolt.com
- **Senha**: 123456
- **Acesso**: Vendas e consulta de produtos

> ⚠️ **Importante**: Altere as senhas padrão imediatamente após o primeiro acesso em ambiente de produção.

## 🛡️ Segurança da Sessão

### ⏰ Duração da Sessão
- **Tempo padrão**: 24 horas
- **Inatividade**: Session expira automaticamente
- **Múltiplos dispositivos**: Permitido com sincronização

### 🔒 Proteções Implementadas
- **Criptografia de senhas**: bcrypt com salt
- **Tokens JWT**: Autenticação stateless
- **Headers de segurança**: Helmet.js configurado
- **CORS**: Configurado para domínios específicos
- **Rate limiting**: Proteção contra ataques

## 🚪 Processo de Logout

### 📝 Como Fazer Logout

1. **Clique no seu nome** no canto superior direito
2. **Selecione "Sair"** no menu dropdown
3. **Confirme** se solicitado
4. **Você será redirecionado** para a página de login

### 🔄 Logout Automático
- **Inatividade**: Após período configurado
- **Múltiplas abas**: Sincronizado entre abas
- **Fechamento do navegador**: Sessão mantida conforme configuração

## 👤 Tipos de Usuário

### 👨‍💼 Administrador (Admin)
```
Permissões:
✅ Todas as funcionalidades do sistema
✅ Gerenciar usuários (criar, editar, remover)
✅ Configurações do sistema
✅ Todos os relatórios
✅ Backup e restore de dados
✅ Logs de sistema
```

### 👨‍💻 Gerente
```
Permissões:
✅ Gestão de produtos e categorias
✅ Gestão de vendas
✅ Gestão de clientes e fornecedores
✅ Controle de estoque
✅ Relatórios operacionais
✅ Gerenciar vendedores (limitado)
❌ Configurações críticas do sistema
❌ Gerenciar outros gerentes
❌ Logs de sistema
```

### 👨‍💼 Vendedor
```
Permissões:
✅ Realizar vendas
✅ Consultar produtos
✅ Cadastrar/editar clientes
✅ Verificar estoque
✅ Relatórios próprios
❌ Editar produtos
❌ Configurações
❌ Relatórios de outros vendedores
❌ Gestão de usuários
```

## 🔐 Gerenciamento de Senhas

### 📋 Requisitos de Senha
- **Mínimo**: 6 caracteres (recomendado: 8+)
- **Complexidade**: Recomendado usar letras, números e símbolos
- **Expiração**: Configurável pelo administrador
- **Histórico**: Evita reutilização de senhas recentes

### 🔄 Alteração de Senha

#### Para o Próprio Usuário:
1. **Acesse o perfil** clicando no seu nome
2. **Selecione "Alterar Senha"**
3. **Digite a senha atual**
4. **Digite a nova senha**
5. **Confirme a nova senha**
6. **Clique em "Salvar"**

#### Para Administradores (resetar senha de outros):
1. **Acesse "Usuários"** no menu
2. **Localize o usuário**
3. **Clique em "Editar"**
4. **Clique em "Resetar Senha"**
5. **Digite a nova senha temporária**
6. **Marque "Forçar alteração no próximo login"**
7. **Salve as alterações**

## 🚨 Problemas Comuns e Soluções

### ❌ "Email ou senha incorretos"
**Causas possíveis**:
- Email digitado incorretamente
- Senha incorreta
- Caps Lock ativado
- Usuário inativo

**Soluções**:
1. Verifique se o email está correto
2. Confirme se a senha está correta
3. Verifique o Caps Lock
4. Contate o administrador se o usuário estiver inativo

### ❌ "Sessão expirada"
**Causas**:
- Tempo de inatividade excedido
- Token JWT expirado
- Problemas de conectividade

**Soluções**:
1. Faça login novamente
2. Verifique sua conexão com a internet
3. Limpe o cache do navegador se persistir

### ❌ "Acesso negado"
**Causas**:
- Tentativa de acesso a função sem permissão
- Perfil de usuário inadequado
- Configuração de permissões incorreta

**Soluções**:
1. Verifique se você tem permissão para a função
2. Contate seu gerente ou administrador
3. Confirme seu perfil de usuário

### ❌ "Muitas tentativas de login"
**Causas**:
- Rate limiting ativado por segurança
- Múltiplas tentativas com senha incorreta

**Soluções**:
1. Aguarde alguns minutos antes de tentar novamente
2. Verifique se suas credenciais estão corretas
3. Contate o administrador se necessário

## 🔧 Configurações de Segurança (Admin)

### ⚙️ Configurações Disponíveis
- **Tempo de sessão**: Configurar duração máxima
- **Política de senhas**: Definir requisitos mínimos
- **Rate limiting**: Configurar proteção contra ataques
- **Logs de acesso**: Habilitar/desabilitar logging
- **Notificações**: Alertas de login suspeito

### 📊 Monitoramento
- **Logs de login**: Histórico de acessos
- **Tentativas falhadas**: Monitoring de tentativas suspeitas
- **Sessões ativas**: Usuários atualmente conectados
- **Relatórios de segurança**: Análise de padrões de acesso

## 📱 Acesso Mobile

### 🔐 Login em Dispositivos Móveis
- **Interface otimizada**: Design responsivo para mobile
- **Teclado virtual**: Suporte completo para entrada de dados
- **Biometria**: Suporte futuro para impressão digital/Face ID
- **Offline**: Funcionalidade limitada sem conexão

### 📲 Aplicativo (Futuro)
- **App nativo**: Em desenvolvimento
- **Sincronização**: Dados sincronizados com web
- **Push notifications**: Alertas em tempo real
- **Offline mode**: Funcionalidades essenciais offline

## 🛠️ Troubleshooting Avançado

### 🔍 Verificação de Logs (Admin)
```sql
-- Verificar tentativas de login recentes
SELECT * FROM auth_logs 
WHERE created_at >= NOW() - INTERVAL '1 hour' 
ORDER BY created_at DESC;

-- Usuários ativos
SELECT u.nome, u.email, u.last_login 
FROM profiles u 
WHERE u.ativo = true;
```

### 🧹 Limpeza de Sessão
```javascript
// Limpar sessão local (navegador)
localStorage.removeItem('bvolt-user');
sessionStorage.clear();

// Recarregar página
window.location.reload();
```

### 🔄 Reset de Configurações
Para casos extremos, o administrador pode:
1. Resetar configurações de autenticação
2. Forçar logout de todos os usuários
3. Regenerar chaves JWT
4. Limpar cache de sessões

## 📞 Suporte

### 🆘 Quando Contatar o Suporte
- Problemas persistentes de login
- Suspeita de acesso não autorizado
- Necessidade de recuperação de conta
- Problemas de performance na autenticação

### 📧 Informações para o Suporte
Ao entrar em contato, forneça:
- **Nome de usuário/email**
- **Tipo de problema**
- **Navegador e versão**
- **Mensagens de erro específicas**
- **Horário aproximado do problema**