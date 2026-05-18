# Usamos una imagen ligera de Node.js
FROM node:18-alpine

# Carpeta de trabajo
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos librerías
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto del backend
EXPOSE 3000

# Comando para iniciar
CMD ["node", "index.js"]