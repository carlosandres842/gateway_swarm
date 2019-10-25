FROM nginx:alpine

RUN apk add g++
RUN apk add gcc
RUN wget 'http://nginx.org/download/nginx-1.17.3.tar.gz'
RUN tar -xzvf nginx-1.17.3.tar.gz
WORKDIR nginx-1.17.3/
CMD ./configure --add-module=/path/to/ngx_lfqueue
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8083
