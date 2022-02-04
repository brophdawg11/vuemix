FROM node:16-alpine as build
WORKDIR /vuemix
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production
CMD npm run start
