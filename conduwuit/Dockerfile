# conduwuit/Dockerfile
FROM matrixconduit/matrix-conduit:latest

WORKDIR /opt/sky0cloud

# Ensure files are copied with a non-root owner (1000 is common for app users)
COPY --chown=1000:1000 entrypoint.sh /opt/sky0cloud/entrypoint.sh
COPY --chown=1000:1000 scripts/ensure-config.sh /opt/sky0cloud/scripts/ensure-config.sh
COPY --chown=1000:1000 config/default.config.json /opt/sky0cloud/config/default.config.json

# Do not run package manager commands that the base image doesn't support.
# Ensure entrypoint is executable at runtime by setting ownership and mode on the host,
# or rely on the runtime user to execute it.

ENTRYPOINT ["/opt/sky0cloud/entrypoint.sh"]
CMD ["/usr/local/bin/matrix-conduit", "/etc/conduwuit/conduwuit.toml"]
