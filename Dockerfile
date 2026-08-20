# ---------- Dependencies ----------
FROM node:22-alpine AS deps

RUN apk update && apk upgrade

# Upgrade npm to the version that contains the fixed dependencies
RUN npm install -g npm@12.0.2

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# ---------- Build ----------
FROM node:22-alpine AS builder

RUN apk update && apk upgrade

RUN npm install -g npm@12.0.2

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ---------- Production ----------
FROM node:22-alpine AS runner

RUN apk update && apk upgrade

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Remove npm from the runtime image.
# Next.js standalone only needs Node.js to run server.js.
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]