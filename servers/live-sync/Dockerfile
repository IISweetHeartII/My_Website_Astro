FROM oven/bun:1.1.38-alpine
WORKDIR /app
COPY server.mjs ./
COPY public ./public
ENV PORT=8787
EXPOSE 8787
CMD ["bun", "server.mjs"]
