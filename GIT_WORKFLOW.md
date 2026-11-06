# Git Workflow — CodeWatch

Este documento estabelece as práticas de versionamento utilizadas no desenvolvimento do projeto CodeWatch.

O objetivo é manter o histórico de alterações organizado, facilitar a colaboração entre desenvolvedores e reduzir o risco de perda de código ou envio de arquivos desnecessários ao repositório.

## 1. Repositório

Repositório remoto:

```text
https://github.com/EduCoderJ/CodeWatch---MC
```

Branch de desenvolvimento:

```text
atom-dev
```

## 2. Organização das branches

As branches devem ser utilizadas para separar o desenvolvimento de funcionalidades e correções.

| Branch | Finalidade |
|---|---|
| `main` | Versão principal e estável do projeto |
| `atom-dev` | Desenvolvimento e integração de alterações |

## 3. Fluxo básico de trabalho

### 3.1. Verificar a branch atual

```powershell
git branch
```

O asterisco indica a branch atualmente selecionada.

Para acessar a branch de desenvolvimento:

```powershell
git switch atom-dev
```

### 3.2. Atualizar o repositório local

Antes de iniciar novas alterações:

```powershell
git pull origin atom-dev
```

Isso atualiza a branch local com as alterações disponíveis no repositório remoto.

### 3.3. Verificar as alterações

Após modificar arquivos:

```powershell
git status
```

Esse comando apresenta os arquivos modificados, adicionados ou removidos.

### 3.4. Preparar os arquivos para commit

Para adicionar todas as alterações:

```powershell
git add .
```

Também é possível adicionar arquivos individualmente:

```powershell
git add backend/main.py
git add Sites/kallopoli/Chatcol.html
```

A segunda abordagem é recomendada quando se deseja ter maior controle sobre o conteúdo do commit.

### 3.5. Revisar os arquivos preparados

Antes de realizar o commit:

```powershell
git status
git diff --cached
```

Verifique se:
- Os arquivos adicionados são realmente necessários.
- Nenhuma credencial ou chave de API foi incluída.
- Arquivos temporários, caches ou ambientes virtuais não foram adicionados.
- As alterações correspondem ao objetivo do commit.

### 3.6. Criar o commit

Utilize mensagens curtas e descritivas:

```powershell
git commit -m "feat: adicionar recebimento de audio"
```

Exemplos de prefixos:

| Prefixo | Utilização |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de problema |
| `refactor:` | Reorganização ou melhoria interna do código |
| `docs:` | Alterações na documentação |
| `chore:` | Manutenção e limpeza do projeto |
| `test:` | Adição ou modificação de testes |

Exemplos:

```text
feat: adicionar transcricao de audio
fix: corrigir conexao com a API
docs: atualizar README
chore: remover arquivos temporarios
refactor: reorganizar processamento de mensagens
```

### 3.7. Enviar as alterações ao GitHub

```powershell
git push origin atom-dev
```

Após a execução, os commits locais serão enviados para a branch remota correspondente.

## 4. Fluxo resumido

O fluxo habitual de atualização pode ser representado pelos seguintes comandos:

```powershell
# Acessar a branch de desenvolvimento
git switch atom-dev

# Atualizar o repositório
git pull origin atom-dev

# Verificar alterações
git status

# Preparar arquivos
git add .

# Revisar o conteúdo preparado
git diff --cached

# Criar commit
git commit -m "feat: descrever alteracao"

# Enviar ao GitHub
git push origin atom-dev
```

## 5. Cuidados com arquivos e credenciais

Os seguintes arquivos e diretórios não devem ser enviados ao repositório:

- `.env` e arquivos que contenham credenciais.
- `venv/` e `.venv/`.
- `__pycache__/`.
- Arquivos `.pyc`.
- Caches de ferramentas.
- Logs temporários.
- Arquivos de backup sem utilidade para o projeto.

O arquivo `.gitignore` deve ser mantido atualizado para evitar o versionamento desses conteúdos.

O arquivo `.env.example` pode ser versionado, desde que contenha apenas valores ilustrativos e não credenciais reais.

**Atenção:** adicionar um arquivo ao `.gitignore` não remove arquivos que já estejam sendo rastreados pelo Git.

Se um arquivo sensível já estiver sendo rastreado, será necessário removê-lo do índice do Git e, caso suas credenciais tenham sido enviadas ao GitHub, revogá-las e gerar novas.

## 6. Resolução de conflitos

Caso ocorram conflitos durante um `git pull`:

1. Identifique os arquivos em conflito.
2. Abra os arquivos e examine as alterações concorrentes.
3. Preserve as modificações necessárias.
4. Remova os marcadores de conflito (`<<<<<<<`, `=======` e `>>>>>>>`).
5. Teste o projeto.
6. Adicione os arquivos corrigidos e conclua a operação.

Comandos úteis:

```powershell
git status
git diff
git add .
git commit
```

Não utilize `git reset --hard` ou force push sem compreender as consequências, pois essas operações podem descartar alterações ou sobrescrever o histórico remoto.

## 7. Boas práticas

- Realizar commits pequenos e com objetivos claros.
- Evitar agrupar funcionalidades diferentes em um único commit.
- Atualizar a branch antes de começar novas alterações.
- Revisar os arquivos antes de executar `git push`.
- Não enviar credenciais ou dados privados.
- Testar as funcionalidades principais antes de integrar alterações.
- Manter o README atualizado quando houver mudanças na configuração ou execução do projeto.
- Evitar commits com mensagens genéricas, como `update`, `changes` ou `final version`.

---

**Objetivo:** manter um histórico de desenvolvimento compreensível, seguro e reproduzível, facilitando a manutenção e a colaboração no projeto.