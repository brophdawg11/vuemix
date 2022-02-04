FROM node:16-alpine as build
WORKDIR /vuemix
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine as production
WORKDIR /vuemix
COPY --from=build /vuemix/package.json /vuemix/package-lock.json ./
COPY --from=build /vuemix/node_modules ./node_modules
RUN npm prune --production
COPY --from=build /vuemix/dist ./dist
COPY --from=build /vuemix/server ./server
COPY --from=build /vuemix/vuemix ./vuemix
CMD npm run start
