FROM node:18-alpine AS base
WORKDIR /app
# Install OpenSSL for Prisma
RUN apk add --no-cache openssl1.1-compat
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS dev
WORKDIR /app
# Install OpenSSL for Prisma
RUN apk add --no-cache openssl1.1-compat
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS build
COPY . .
RUN npm ci
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
# Install OpenSSL for Prisma
RUN apk add --no-cache openssl1.1-compat
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]