########################
# Build stage
########################
FROM node:24-alpine AS build
WORKDIR /app

# Install deps needed to build
COPY . .
RUN yarn install --frozen-lockfile

# Copy sources and build bundle
COPY . .
RUN yarn package:docker

WORKDIR /app/dist

# Install dist dependencies only
RUN yarn install

########################
# Runtime stage
########################
FROM node:24-alpine AS runtime
WORKDIR /app

# (Optional but recommended) create non-root user
RUN addgroup -S appuser && adduser -S appuser -G appuser

# Copy built output
COPY --from=build /app/dist /app

# SQLite data volume (mount this so DB persists)
# If your app writes sqlite to a different location, change /data accordingly.
RUN mkdir -p /data && chown appuser:appuser /data
VOLUME ["/data"]
RUN node initEnv.js "/data/.env"

# If your server listens on another port, change this.
EXPOSE 3000

USER appuser

ENV APP_DB_DATABASE="/data/app.sqlite"
ENV PORT=3000

# Run the bundled server
ENTRYPOINT ["node", "./code/server.js", "--mode=docker", "--env='/data/.env'"]
