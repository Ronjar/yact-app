# ----------  build stage ----------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build         # vite build + tsc socket

# ----------  runtime stage ----------
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY server ./server

EXPOSE 3000
CMD ["node", "server/index.js"]
