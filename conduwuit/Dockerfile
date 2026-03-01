FROM matrixconduit/matrix-conduit:latest
WORKDIR /opt/sky0cloud

COPY --chown=1000:1000 entrypoint.sh /opt/sky0cloud/entrypoint.sh
COPY --chown=1000:1000 scripts/ensure-config.sh /opt/sky0cloud/scripts/ensure-config.sh
COPY --chown=1000:1000 config/default.config.json /opt/sky0cloud/config/default.config.json

ENTRYPOINT ["/opt/sky0cloud/entrypoint.sh"]
CMD ["/usr/local/bin/matrix-conduit", "/etc/conduwuit/conduwuit.toml"]
