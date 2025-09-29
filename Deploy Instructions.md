**BACKEND**

**Primeira vez:**

***gcloud init*** → só precisa na primeira configuração (para autenticar, selecionar projeto e região).
***gcloud run deploy --source .*** → esse sim você vai usar sempre que quiser atualizar o backend. Ele faz o build e deploy a partir do código local.



**Dia a dia**

Se você só alterou o código → basta rodar novamente:
***gcloud run deploy --source .***



----------------------------------------------



**gcloud:** É o CLI do Google Cloud.
Com ele você consegue interagir com todos os serviços da Google Cloud (Cloud Run, Build, SQL, Storage, etc.) direto pelo terminal.

**run:** Subcomando do gcloud.
Significa que você vai usar o serviço Cloud Run (que serve para rodar containers sem precisar gerenciar servidores).

**deploy:** A ação que você está pedindo.
Fazer o deploy de um serviço (criar ou atualizar).

**--source:** indica que o deploy será feito a partir do código-fonte (e não de uma imagem Docker já pronta).

**. (ponto):** significa “da pasta atual onde estou rodando o comando”.




----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




**FRONTEND**

Gerar o Build:
***npm run build***

Fazer o Deploy:
***firebase deploy --only hosting***



----------------------------------------------



**firebase** É a CLI do Firebase. Permite interagir com os serviços do Firebase (Hosting, Functions, Firestore, etc.).

**deploy:** Diz à CLI que você quer enviar/deployar seu projeto para os servidores do Firebase.

**--only hosting:** Indica que você quer fazer deploy apenas do Hosting, ou seja, só o frontend (arquivos do build).

