# Verwende das offizielle Node.js Image als Basis
FROM node:16

# Setze das Arbeitsverzeichnis im Container
WORKDIR /usr/src/app

# Kopiere die package.json und package-lock.json Dateien
COPY backend/package*.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den gesamten Backend-Code
COPY backend/ ./backend/

# Kopiere den Frontend-Code
COPY frontend/ ./frontend/

# Exponiere den Port, auf dem die Anwendung läuft
EXPOSE 3000

# Starte die Anwendung
CMD ["node", "backend/server.js"]
