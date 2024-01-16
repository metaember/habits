FROM node:21-alpine3.18

WORKDIR /frontend

COPY ./package.json /frontend/package.json

RUN npm install

COPY . /frontend


EXPOSE 3000

CMD ["npm", "start"]
