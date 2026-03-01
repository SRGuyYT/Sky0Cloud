FROM matrixconduit/matrix-conduit:latest

COPY --chmod=755 scripts/ensure-config.sh /opt/sky0cloud/scripts/ensure-config.sh
COPY --chmod=755 conduwuit/entrypoint.sh /opt/sky0cloud/entrypoint.sh
COPY config/default.config.json /opt/sky0cloud/config/default.config.json

ENTRYPOINT ["/opt/sky0cloud/entrypoint.sh"]
CMD ["/etc/conduwuit/conduwuit.toml"]
