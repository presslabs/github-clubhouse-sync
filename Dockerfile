FROM node:8.9

ENV NODE_PATH /node_modules
RUN yarn install --modules-folder $NODE_PATH

ENTRYPOINT entrypoint.js
