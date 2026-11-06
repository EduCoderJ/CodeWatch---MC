# CodeWatch — MIA | Assistente de RH

Uma colaboração das trilhas de **IA & Dados** e **Java** do **Geração Caldeira 2026**
equipe de desenvolvimento: Helena cabral Damaceno, Emiliy Barbosa Moscardini, Eduardo Caldeira xavier, Gabrieli Matis De camargo e Mateus Gularte Ferreira

## 1. Sobre o projeto

O **MIA** é um assistente virtual desenvolvido para facilitar a comunicação entre colaboradores e o setor de Recursos Humanos da Kallopolli.

O sistema utiliza inteligência artificial para interpretar mensagens, responder às solicitações dos colaboradores e encaminhar informações relevantes ao setor de RH.

A aplicação também permite o envio de mensagens de áudio, que são transcritas automaticamente antes de serem processadas pela inteligência artificial.

## 2. Funcionalidades

- **Atendimento por texto:** recebe mensagens dos colaboradores e gera respostas utilizando um modelo de linguagem.
- **Atendimento por áudio:** permite gravar e enviar mensagens de voz para transcrição e processamento.
- **Transcrição de áudio:** utiliza o Whisper da Groq para converter mensagens de voz em texto.
- **Análise de mensagens:** realiza uma análise adicional do conteúdo para identificar informações relevantes ao RH.
- **Integração com Java:** encaminha os registros processados para a API responsável pelo armazenamento das informações.
- **Interface web:** disponibiliza um ambiente de conversação para interação com o assistente.

## 3. Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| Python | Linguagem principal do backend |
| FastAPI | Criação da API e gerenciamento das requisições |
| Groq API | Acesso aos modelos de inteligência artificial |
| Whisper | Transcrição de mensagens de áudio |
| HTML, CSS e JavaScript | Interface web |
| Java | Serviço de integração e armazenamento de registros |
| Git e GitHub | Versionamento e colaboração |

## 4. Configuração do ambiente

### 4.1. Pré-requisitos

Antes de executar o projeto, é necessário ter:

- Python instalado.
- Git instalado.
- Uma chave de API da Groq.
- O serviço Java de integração configurado, quando necessário.
- Um navegador compatível com a gravação de áudio.

### 4.2. Clonar o repositório

```powershell
git clone https://github.com/EduCoderJ/CodeWatch---MC.git
cd CodeWatch---MC
```

Para trabalhar na branch de desenvolvimento:

```powershell
git switch atom-dev
```

### 4.3. Criar o ambiente virtual

Dentro da pasta do backend:

```powershell
cd backend

python -m venv venv
```

Ative o ambiente virtual no Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Caso o PowerShell bloqueie a execução do script:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Depois, execute novamente o comando de ativação.

### 4.4. Instalar as dependências

Instale as dependências Python a partir do arquivo de requisitos utilizado pelo projeto.

Caso esteja utilizando `framework/requirements.txt`, execute na raiz:

```powershell
python -m pip install -r framework/requirements.txt
```

Verifique se todas as bibliotecas importadas pelo backend estão contempladas no arquivo, incluindo as necessárias para FastAPI, Groq, requisições HTTP e recebimento de arquivos multipart.

### 4.5. Configurar as variáveis de ambiente

Crie o arquivo:

```text
backend/.env
```

Utilize o arquivo `backend/.env.example` como referência.

Exemplo:

```env
LLM_API_KEY=sua_chave_da_groq
LLM_BASE_URL=https://api.groq.com/openai/v1
```

**Importante:** nunca compartilhe ou envie o arquivo `.env` para o GitHub. Ele contém credenciais privadas.

O arquivo `.env.example` deve conter somente nomes de variáveis e valores ilustrativos.

## 5. Executando o projeto

### 5.1. Iniciar o backend

Abra um terminal na pasta `backend`, ative o ambiente virtual e execute:

```powershell
uvicorn main:app --reload --port 8001
```

A API ficará disponível em:

```text
http://127.0.0.1:8001
```

A documentação interativa do FastAPI pode ser acessada em:

```text
http://127.0.0.1:8001/docs
```

### 5.2. Iniciar o serviço Java

O backend Python utiliza uma API Java para encaminhar os registros ao sistema de armazenamento.

Por padrão, o endereço configurado é:

```text
http://localhost:8080/api/relatos
```

O serviço Java deve ser iniciado separadamente, seguindo as instruções de execução do respectivo módulo.

### 5.3. Abrir o frontend

Abra `Sites/kallopoli/Chatcol.html` utilizando um servidor local, como a extensão Live Server do Visual Studio Code.

A interface deve conseguir acessar o backend Python pela porta `8001`.

Para utilizar o recurso de áudio, conceda ao navegador permissão de acesso ao microfone.

## 6. Rotas principais da API

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/` | Verificação básica da API |
| POST | `/api/whatsapp/webhook` | Recebimento e processamento de mensagens de texto |
| POST | `/api/whatsapp/audio` | Recebimento, transcrição e processamento de mensagens de áudio |

Consulte `/docs` para verificar os parâmetros e formatos esperados por cada rota.