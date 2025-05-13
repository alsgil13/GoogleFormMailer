//Adicionar trigger

function criaTrigger(){
    var form = FormApp.getActiveForm();
    ScriptApp.newTrigger('respMailer')
    .forForm(form)
    .onFormSubmit()
    .create();
}


function respMailer(){
  
// ----------------------------- Constantes definidas pelo usuário ---------------------------------------------------------------



/** 
 * E-mails para onde serão enviadas as respostas
 * adicione quantos endereços de e-mail forem necessários
 * Exemplo:
 *  const emails = ['als_gil@ffclrp.usp.br','informatica@listas.ffclrp.usp.br','outro@email.com'];
 **/
  const emails = ['als_gil@ffclrp.usp.br'];
/** 
 * Define para quem será encaminhadas as respostas, erros também serão reportados à este e-mail
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
// --------------------------------------------------------------------------------------------------------------------------------- 
 
  const form = FormApp.getActiveForm();

  var todosArquivos = [];
  const cores = ['#ffebee','#fce4ec','#f3e5f5','#ede7f6','#e8eaf6','#e3f2fd','#e1f5fe','#e0f7fa','#e0f2f1','#e8f5e9','#f1f8e9','#f9fbe7','#fffde7','#fff8e1','#fafafa','#eceff1'];
  var c = cores.length-1;

  var corDeFundo = cores[c];
  
  var formResponses = form.getResponses();
  formResponse = formResponses[formResponses.length - 1];
  var itemResponses = formResponse.getItemResponses();
  var todosItens = form.getItems();

  //Coleta o e-mail do usuário, necessita de autenticação google nas respostas
  try{
    var emailUserForm = formResponse.getRespondentEmail();
  } catch (e){
    Logger.log("Usuário não autenticado, impossível captar e-mail");
    var emailUserForm = "Usuário não autenticado, impossível captar e-mail";
  }

  if(emailUserForm == ""){
    emailUserForm = "Usuário não autenticado, impossível captar e-mail";
  }
  //Só pra deixar expostos os tipos que são tratados no Switch
  //var types = ['MULTIPLE_CHOICE','FILE_UPLOAD','PARAGRAPH_TEXT','TEXT','CHECKBOX','SCALE','GRID','CHECKBOX_GRID','DATE','TIME'];


  var mensagem = "";
  var anexos = [];
  var defaultNaoResp = "<p style='color:red'><i>Pergunta não respondida</i></p>";

  // Varre a resposta do form

  mensagem = mensagem + "<p>Resposta " + (formResponses.length).toString() + " enviado por: " + emailUserForm + "</p>";



  mensagem = mensagem + "<div style='background-color:"+corDeFundo+";'>";
  mensagem = mensagem + "<h1 style='text-align: center;'>"+form.getTitle()+"</h1>";
  mensagem = mensagem + "<p>"+form.getDescription()+"</p>";
  for (var r = 0; r < todosItens.length; r++) {
    mensagem = mensagem + "<hr>";

    var itemResponse = todosItens[r];
    var indice = itemResponse.getIndex();
    var itemTipo = itemResponse.getType().toString();
    var pergunta = itemResponse.getTitle();
    
//    mensagem = mensagem + "<p>Indice: " + indice.toString() + "</p>"
    switch (itemTipo) {
      case 'PAGE_BREAK':
          mensagem = mensagem + "</div>";
          c--;
          if (c<0){
            c=cores.length-1;
          }
          corDeFundo = cores[c];
          mensagem = mensagem + "<div style='background-color:"+corDeFundo+";'>";
          mensagem = mensagem + "<h2 style='text-align: center;'>" + pergunta + "</h2>";
        break;

      case 'MULTIPLE_CHOICE':
        var escolhas = itemResponse.asMultipleChoiceItem().getChoices();
        
        var resposta = formResponse.getResponseForItem(itemResponse);
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Múltipla Escolha</i></small>";
        }
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong></p>";
        if(resposta!==null){
          var resposta = resposta.getResponse();
          //console.log(resposta);

          escolhas.forEach(function(escolha){
            if(escolha.getValue() == resposta){
              mensagem = mensagem + "<ul style='list-style-type: disc';><li><strong>"+escolha.getValue()+"</strong></li></ul>";
            } else {
              mensagem = mensagem + "<ul style='list-style-type: circle';><li>"+escolha.getValue()+"</li></ul>";
            }
          });
        } else{
          mensagem = mensagem + defaultNaoResp;
        }
        break;
      case 'FILE_UPLOAD':
        
        var fileResponse = formResponse.getResponseForItem(itemResponse);
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Upload de arquivo</i></small>";
        }
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong> <small>(<i>Os arquivos foram anexados ao e-mail</i>)</small></p>";
        if(fileResponse!== null){
          var idsFiles = formResponse.getResponseForItem(itemResponse).getResponse().toString().split(",");
          
          mensagem = mensagem + "<ul style='list-style-type: none'>";
          for (var i = 0; i < idsFiles.length; i++) {

            idFile = idsFiles[i];
            todosArquivos.push(idFile);
            var file = DriveApp.getFileById(idFile);
            if(file.getName()[0] == 'Q' &&  file.getName()[1] == r.toString()){
              var nameFile = file.getName();
            } else {
              var nameFile = "Q" + (r+1).toString() + "F" + (i+1).toString() + " - "+file.getName();
            }
            
            
            file.setName(nameFile);
            mensagem = mensagem + "<li> Id do arquivo enviado"+ i + ": " + idFile + " - <strong>Nome: " + nameFile + " </strong></li>";
            var tipoFile = file.getMimeType();
            anexos.push(file.getAs(tipoFile));
          }
          mensagem = mensagem + "</ul>";

        }else {
          mensagem = mensagem + defaultNaoResp;
        }
        break;

      case 'PARAGRAPH_TEXT':
        var resposta = formResponse.getResponseForItem(itemResponse).getResponse().toString();
        console.log(resposta.length);
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Resposta longa</i></small>";
        }      
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong></p>";
        if(resposta.length>0){
          mensagem = mensagem + "<p>" + resposta + "</p>";
        } else {
          mensagem = mensagem + defaultNaoResp;
        }
        break;

      case 'TEXT':
        var resposta = formResponse.getResponseForItem(itemResponse).getResponse().toString();
        console.log(resposta.length);
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Resposta Curta</i></small>";
        }          
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong></p>";
        if(resposta.length>0){
          mensagem = mensagem + "<p>" + resposta + "</p>";
        } else {
          mensagem = mensagem + defaultNaoResp;
        }
        break;

      case 'CHECKBOX':
        var resp = formResponse.getResponseForItem(itemResponse);
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Caixa de Seleção</i></small>";
        }           
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong></p>";
        if(resp!==null){
          var escolhas = itemResponse.asCheckboxItem().getChoices();
          var resposta = resp.getResponse();
          var escolhasArray = [];
          escolhas.forEach(function(escolha){
            e = escolha.getValue();
            escolhasArray.push(e);
            if(resposta.includes(e)){
              mensagem = mensagem + "<p>&#9746; " + e +"</p>";
            } else {
              mensagem = mensagem + "<p>&#9744; " + e +"</p>";
            }
          });
          if(itemResponse.asCheckboxItem().hasOtherOption()){
            if(!escolhasArray.includes(resposta[resposta.length-1])){
              mensagem = mensagem + "<p>&#9746; <strong>Outros</strong>:<u> " + resposta[resposta.length-1] +"</u></p>";
            } else {
              mensagem = mensagem + "<p>&#9744; <strong>Outros</strong>: _______</p>";
            }
          }

        } else {
          mensagem = mensagem + defaultNaoResp
        }
        break;
      case 'SCALE':
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Escala Linear</i></small>";
        }             
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong></p>";

        var resposta = formResponse.getResponseForItem(itemResponse);
        if(resposta!==null){
          resposta = resposta.getResponse();
          var grauInicial = itemResponse.asScaleItem().getLowerBound().toString();
          var grauFinal   = itemResponse.asScaleItem().getUpperBound().toString();
          var labelInicial = itemResponse.asScaleItem().getLeftLabel();
          var labelFinal   = itemResponse.asScaleItem().getRightLabel();
        
          //Logger.log(resposta);
          mensagem = mensagem + "<p>" + labelInicial + "&#9;";
          for(var i = grauInicial; i <= grauFinal; i++){
              if(i==resposta){
                //mensagem = mensagem + "&#9672;&#9;";
                mensagem = mensagem + "<strong>("+i+")&#9;&#9;</strong>";
              } else{
                //mensagem = mensagem + "&#9671;&#9;";
                mensagem = mensagem + "("+i+")&#9;&#9;";
              }
              //mensagem = mensagem + "&tab; <p>";

          }
          mensagem = mensagem + "&#9;" + labelFinal + "&#9;<br>Valor Selecionado: " + resposta.toString() + "</p>";

        } else {
          mensagem = mensagem + defaultNaoResp
        }


        break;

      case 'GRID':
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Grade Multipla Escolha</i></small>";
        }           
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong></p>";
        var resposta = formResponse.getResponseForItem(itemResponse);
        if(resposta!==null){
          var resp = resposta.getResponse();
          var colunas = itemResponse.asGridItem().getColumns();
          var linhas = itemResponse.asGridItem().getRows();

          //Logger.log(resp);
          mensagem = mensagem + "<table><thead>";
          mensagem = mensagem + "<th></th>";
          for(var i = 0; i < colunas.length; i++){
            mensagem = mensagem + "<th>"+colunas[i]+"</th>";
          }
          mensagem = mensagem + "</thead><tbody>";
          for(var i = 0; i < linhas.length; i++){
            mensagem = mensagem + "<tr>";  
            mensagem = mensagem + "<td>"+linhas[i]+"</td>";
            for(var j = 0; j < colunas.length; j++){
              
              if(resp[i] == colunas[j]){
                mensagem = mensagem + "<td style='text-align:center'>&#9673;</td>";  
              } else{
                mensagem = mensagem + "<td style='text-align:center'>&#9675;</td>";
              }
            }
            mensagem = mensagem + "</tr>";  
          }
          mensagem = mensagem + "</tbody></table>";  

        } else {
          mensagem = mensagem + defaultNaoResp
        }
        break;

      case 'CHECKBOX_GRID':
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Grade de Caixa de Seleção</i></small>";
        }          
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong></p>";
        //resp = array de arrays
        var resposta = formResponse.getResponseForItem(itemResponse);
        if(resposta!==null){
          var resp = resposta.getResponse();
          var colunas = itemResponse.asCheckboxGridItem().getColumns();
          var linhas = itemResponse.asCheckboxGridItem().getRows();

          //Criar tabela
          mensagem = mensagem + "<table><thead>";
          mensagem = mensagem + "<th></th>";
          for(var x=0;x<colunas.length;x++){
              mensagem = mensagem + "<th>"+colunas[x]+"</th>";
          }
          mensagem = mensagem + "</thead><tbody>";
          for(var n = 0; n < linhas.length; n++){
              mensagem = mensagem + "<tr>";
              mensagem = mensagem + "<td>"+linhas[n]+"</td>";
              var respLin = resp[n];
              for(var k = 0; k < colunas.length; k++){
                if(respLin === null){
                  mensagem = mensagem + "<td style='text-align:center'> &#9634; </td>";
                } else {
                  if(respLin.includes(colunas[k])){
                    mensagem = mensagem + "<td style='text-align:center'> &#9635; </td>";
                  } else {
                    mensagem = mensagem + "<td style='text-align:center'> &#9634; </td>";
                  }
                }
              }
              mensagem = mensagem + "</tr>";
          }
          mensagem = mensagem + "</tbody></table>";
        } else {
          mensagem = mensagem + defaultNaoResp
        }
        break;

      case 'DATE':
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Data</i></small>";
        }         
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong></p>";
        
        var amd = formResponse.getResponseForItem(itemResponse).getResponse().toString().split("-");
        var dma = "";
        if(amd!=''){
          dma = amd[2].toString() + "/" + amd[1].toString() + "/" + amd[0].toString()
        } else{
          dma = defaultNaoResp;
        }
        mensagem = mensagem + "<p>" +  dma + "</p>";
        break;
      case 'TIME':
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Horário</i></small>";
        }
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong></p>";
        var resp = formResponse.getResponseForItem(itemResponse).getResponse().toString();
        if(resp.length>0){
          mensagem = mensagem + "<p>" + resp + "</p>";      
        } else {
          mensagem = mensagem + defaultNaoResp
        }
        
        break;
      case 'SECTION_HEADER':
        var titulo = itemResponse.getTitle();
        var desc = itemResponse.getHelpText();
        mensagem = mensagem + "<h3>"+titulo+"</h3>";
        mensagem = mensagem + "<p>"+desc+"</p>";
        break;
      default:
        if(mostraTipo){
          mensagem = mensagem + "<small><i>Tipo de questão: Tipo não mapeado</i></small>";
        }
        Logger.log(itemResponse.getType().toString());
        mensagem = mensagem + "<p><strong>" + pergunta + "</strong></p>";
        var resposta = formResponse.getResponseForItem(itemResponse).getResponse().toString();
        if(resposta.length > 0){
          mensagem = mensagem + "<p>" + resposta + "</p>";
        } else {
          mensagem = mensagem + defaultNaoResp
        }
        Logger.log('Tipo de questão não tratado');
        break;

    } // fecha switch
  }
  mensagem = mensagem + "</div>";

    var mailOptions = {
      htmlBody:mensagem,
      attachments: anexos,
      name: form.getTitle().toString() + ": Nova Resposta",
      replyTo: emailReply,
    }


    //Enviar e-mails
    try{
      for (var q = 0; q < emails.length; q++){
        try{
          GmailApp.sendEmail(emails[q],form.getTitle().toString(),mensagem, mailOptions);    
          Logger.log("Email enviado para: " + emails[q]);
          Logger.log("Mensagem: ");
          Logger.log(mensagem);

        } catch(e){
          Logger.log("Falha ao enviar email para: " + emails[q]);
          Logger.log("Mensagem: ");
          Logger.log(mensagem);
          Logger.log("Erro: ");
          Logger.log(e);

          try{
            GmailApp.sendEmail(emailReply,"Falha ao enviar email para: " + emails[q],mensagem, mailOptions);    
            Logger.log("Mensagem: ");
            Logger.log(mensagem);

          } catch(ee){
            Logger.log("Erro ao notificar Admin: ");
            Logger.log(ee);
            Logger.log("Email admin: ");
            Logger.log(emailReply);
            Logger.log("Mensagem: ");
            Logger.log(mensagem);
          }
        }
      }
    
      //Apagar respostas
    if(apagarResp){
      var responseId = formResponse.getId();
      Logger.log("Apagando resposta: " + responseId);
      form.deleteResponse(responseId);
    }

    //Apagar arquivos do Drive
    if(apagarArquivosDrive){
      for(a=0; a < todosArquivos.length; a++ ){
        var file = DriveApp.getFileById(todosArquivos[a]);
        file.setTrashed(true);
        Logger.log("Arquivo " + todosArquivos[a] + " enviado para lixeira");
      }
    }
  } catch(p){
    Logger.log("As respostas não foram apagadas");
    Logger.log(p);
    GmailApp.sendEmail(emailReply,"Falha ao apagar respostas","As respostas/arquivos não foram apagadas. Apague os Diretamente no formulário. Erro: " + p);    
  }



}