FROM matrixconduit/matrix-conduit:latest

# The base Conduwuit image is built on a minimal container image
# without a shell, so we MUST NOT use RUN instructions or shell-based
# entrypoints here. We rely entirely on the base image plus the
# CONDUIT_CONFIG environment variable set by docker-compose.

# Start Conduwuit directly
CMD ["/usr/local/bin/matrix-conduit"]
