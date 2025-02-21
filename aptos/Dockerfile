FROM node:23.3.0-slim AS build-stage

RUN apt-get update && apt-get install -y make gcc g++ python3 && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY . ./

RUN node -e "let pkg = require('./package.json'); pkg.packageManager = 'pnpm@9.15.4'; require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"

FROM node:23.3.0-slim

RUN apt-get update && apt-get install -y make gcc g++ python3 && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY --from=build-stage /app /app

COPY docker-entry-point.sh /app/docker-entry-point.sh
RUN chmod 755 /app/docker-entry-point.sh  # Set executable permission for the script

EXPOSE 3000

RUN ls -l /app

CMD ["/app/docker-entry-point.sh"]