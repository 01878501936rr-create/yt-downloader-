FROM node:18

RUN apt update && apt install -y yt-dlp ffmpeg

WORKDIR /app
COPY . .
RUN npm install

CMD ["npm","start"]
