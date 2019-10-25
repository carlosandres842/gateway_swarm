FROM node:8.16
RUN mkdir /prototipo
WORKDIR /prototipo
RUN mkdir /prototipo/aplicaciones
WORKDIR /prototipo/aplicaciones
ADD ./aplicaciones /prototipo/aplicaciones
ADD ./package.json /prototipo/package.json
WORkDIR /prototipo
RUN npm install
ADD ./connection.json /prototipo/connection.json
EXPOSE 8085
WORKDIR /prototipo/aplicaciones/server
CMD node server.js
