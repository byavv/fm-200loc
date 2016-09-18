FROM node:6.3

# Maintainer
MAINTAINER Aksenchyk V. <aksenchyk.v@gmail.com>

# Define app directory
WORKDIR /usr/src/app

# Create app directory
RUN mkdir -p /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/

# Install dependencies and build client
RUN \ 
    npm install \   
    && npm run build

RUN mkdir -p /coverage

VOLUME /usr/src/app/coverage

# Copy app sources
COPY . /usr/src/app

# Make server and client available
EXPOSE 3001
EXPOSE 5601

CMD [ "npm", "start"]
