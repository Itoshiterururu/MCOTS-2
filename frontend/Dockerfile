FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

ARG VITE_MAP_SERVICE_PORT
ENV VITE_MAP_SERVICE_PORT=$VITE_MAP_SERVICE_PORT

ARG VITE_INTELLIGENCE_SERVICE_PORT
ENV VITE_INTELLIGENCE_SERVICE_PORT=$VITE_INTELLIGENCE_SERVICE_PORT

ARG VITE_AUTH_SERVICE_PORT
ENV VITE_AUTH_SERVICE_PORT=$VITE_AUTH_SERVICE_PORT

# Убираем build и установку serve, так как они не нужны для dev режима
ENV PORT=$PORT  

# Запускаем в режиме разработки
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]