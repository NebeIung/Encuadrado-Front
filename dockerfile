# Usa Node 18 para compatibilidad con Vite y React
FROM node:18-alpine

WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del proyecto
COPY . .

# Expone el puerto de Vite
EXPOSE 5173

# Comando de desarrollo
CMD ["npm", "run", "dev", "--", "--host"]