# Google Forms Mailer

O presente projeto destina-se a gerenciar as respostas enviadas em um fomrulário Google Forms.
Através deste é possível enviar as respostas para um ou mais endereços de e-mail definidos imediatamente quando a resposta é submetida, também ó possivel apagar as respostas armazenadas no formulário após o envio, bem como arquvios do Google Drive se for o caso.

## Guia ilustrado de Utilização
Acompanhe os passo abaixo para adicionar as funcionalidades descritas acima ao seu formulário.

### Abra o Editor de Scripts 
Abra o formulário o qual você deseja que o script capte as respostas.
![Abrindo o Editor de scripts](img/abrindoAppScripts.gif)

### Copie e Cole o código
Copie o código presente no arquivo `formManager.js` e cole no editor de scripts substituindo o conteúdo atual.
![Copiando Codigo](img/copiandoCodigo.gif)

### Altere as constantes
Altera as constantes no início do código, através delas é possível:
* Controlar para quais e-mails serão enviadas as respostas
* Alterar para qual e-mail deverão ser encaminhadas as respostas das notificação (replyTo)
* Definir se as respostas deverão ser apagadas do formulário ou não
* Definir se or arquvios do Google Drive deverão ser enviados para a lixeira
* Definir se os tipos das perguntas serão mostrado na resposta

```javascript
// ----------------------------- Constantes definidas pelo usuário --------------------------
/** 
   * E-mails para onde serão enviadas as respostas
   * adicione quantos endereços de e-mail forem necessários
   * Exemplo:
   *  const emails = ['als_gil@ffclrp.usp.br','outro@email.com','...'];
   **/
  const emails = ['als_gil@ffclrp.usp.br'];

/** 
   * Define para quem será encaminhadas as respostas, erros também erão reportados 
   * à este e-mail
   **/
  const emailReply = 'als_gil@ffclrp.usp.br';

/** 
   * Deseja mostrar o tipo de questão?
   *  true: sim
   *  false: não
   **/
  const mostraTipo = true;

/** 
   * Deseja apagar a resposta após o envio do e-mail?
   *  true: sim
   *  false: não
   **/
  const apagarResp = false;

/** 
   * Deseja enviar os arquivos para a lixeira do Drive após o envio do e-mail?
   *  true: sim
   *  false: não
   **/
  const apagarArquivosDrive = false;
// -------------------------------------------------------------------------------------------

```

![Alterando Constantes](img/alterandoConstantes.gif)

### Crie o Gatilho
Selecione a função criaTrigger e execute, demorará algum tempo processando e serão solicitadas permissões dos Apps Google.
![Cria Trigger](img/criaTrigger2.gif)

### Pronto!
Agora basta aguardar as respostas chegarem no seu e-mail. Responda uma vez o formulário para testar o funcionamento.

