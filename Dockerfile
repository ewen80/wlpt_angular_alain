# Multi-stage
# 1) Node image for building frontend assets
# 2) nginx stage to serve frontend assets

# Name the node stage "builder"
FROM node:14.15.4-alpine3.12 AS builder
# Set working directory
WORKDIR /app
COPY package.json ./package.json
RUN npm install
# Copy all files from current directory to working dir in image
COPY . .
# install node modules and build assets
RUN npm run build -- --configuration=production --base-href=/ --deploy-url=/

# nginx state for serving content
FROM nginx:alpine AS nginx
COPY nginx.conf /etc/nginx/conf.d/
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm /etc/nginx/conf.d/default.conf \
    && rm -rf ./* \
    && mkdir download
# Copy static assets from builder stage
COPY --from=builder /app/dist/waap .
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]