FROM node:20-alpine

WORKDIR /workspace

# Limpar cache NPM
RUN npm cache clean --force

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código
COPY . .

# Expor porta
EXPOSE 8000

# Iniciar aplicação
CMD ["npm", "start"]
