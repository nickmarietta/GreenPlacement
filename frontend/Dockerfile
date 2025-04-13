# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# Use a lightweight web server to serve static files
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
