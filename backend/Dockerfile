# Use uma imagem base do Node.js
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de dependência e instala as dependências
COPY package*.json ./
RUN npm install --omit=dev

# Copia todo o código-fonte da aplicação
COPY . .

# Expõe a porta que sua aplicação vai usar (geralmente 8080)
EXPOSE 8080

# Comando para iniciar o servidor
CMD [ "npm", "start" ]
