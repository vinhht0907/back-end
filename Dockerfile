FROM node:14.17.4

#ARG NODE_ENV=production
#ENV NODE_ENV=${NODE_ENV}
ENV TZ=Asia/Ho_Chi_Minh

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update \
    && apt-get install -y ffmpeg

WORKDIR /usr/src/app

RUN npm config set sharp_binary_host "https://npm.taobao.org/mirrors/sharp"
RUN npm config set sharp_libvips_binary_host "https://npm.taobao.org/mirrors/sharp-libvips"

COPY . .
RUN cp .env.production .env
RUN yarn global add @nestjs/cli
RUN yarn install
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start:prod" ]
