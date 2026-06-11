# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build:sass \
  && npm run build:scripts \
  && npm run build:eleventy \
  && npm run postbuild

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs portfolio

COPY --from=builder --chown=portfolio:nodejs /app/_site ./_site
COPY --from=builder --chown=portfolio:nodejs /app/server.cjs ./server.cjs

USER portfolio
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then((r)=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.cjs"]
