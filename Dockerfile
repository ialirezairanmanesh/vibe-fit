FROM docker.fidadev.ir/frontend/vibe-fit-base:1.2.0

WORKDIR /app

COPY . .

RUN bun run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
