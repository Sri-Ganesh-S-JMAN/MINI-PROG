FROM node:lts-alpine AS builder
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /usr/src/app                
COPY . .
RUN npm install && mv node_modules /usr/src/
RUN npm run build


FROM node:lts-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --from=builder /usr/src/app ./
COPY --from=builder /usr/src/node_modules /usr/src/node_modules

EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
