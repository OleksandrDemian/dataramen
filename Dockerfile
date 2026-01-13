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
RUN yarn install --prod

########################
# Runtime stage
########################
FROM node:24-alpine AS runtime
WORKDIR /app

# Use fixed UID and GID to allow access accross multiple containers (ex: when moving to a new version)
ARG UID=1075
ARG GID=1075

# Create non-root user
RUN addgroup -g $GID -S appuser && adduser -u $UID -S appuser -G appuser

# Copy built output
COPY --from=build /app/dist /app

# Create /data, give access to non-root user and mount as volume
RUN mkdir -p /data
RUN chown -R $UID:$GID /data
VOLUME ["/data"]

# Init .env value
RUN node initEnv.js "/data/.env"

EXPOSE 3000

# Default envs
ENV APP_DB_DATABASE="/data/app.sqlite"
ENV PORT=3000

# use non-root user before starting the app
USER appuser

# Run DaraRamen
ENTRYPOINT ["node", "./code/server.js", "--mode=docker", "--env='/data/.env'"]
