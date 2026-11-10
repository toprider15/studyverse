FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV STUDYVERSE_DB=/data/studyverse.db
VOLUME ["/data"]
EXPOSE 3000
CMD ["npm", "start"]