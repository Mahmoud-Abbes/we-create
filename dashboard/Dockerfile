# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:22-alpine
WORKDIR /app
# Angular SSR output is usually in dist/[project-name]/server
COPY --from=build /app/dist/dashboard ./dist/dashboard

EXPOSE 4000
# Command to start the SSR server
CMD ["node", "dist/dashboard/server/server.mjs"]