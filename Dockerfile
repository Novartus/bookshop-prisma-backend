FROM node:14-alpine AS base

WORKDIR /usr/src/app
COPY  package*.json ./

FROM base as test
LABEL stage=tester
RUN npm ci
COPY . .
CMD [ "npm", "run", "test" ]

FROM base as production
LABEL stage=builder
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/main"]
