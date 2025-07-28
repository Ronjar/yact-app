# ----------  build stage ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY svelte.config.* vite.config.* tsconfig.* ./
RUN npm ci

COPY . .
RUN npm run build

# ----------  runtime stage ----------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package*.json ./ 
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY server ./server

EXPOSE 3000
CMD ["node", "server/index.js"]
