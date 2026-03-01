FROM matrixconduit/matrix-conduit:latest

USER root
COPY ./scripts/ensure-config.sh /opt/sky0cloud/scripts/ensure-config.sh
COPY ./conduwuit/entrypoint.sh /opt/sky0cloud/entrypoint.sh
COPY ./config/default.config.json /opt/sky0cloud/config/default.config.json

RUN (apk add --no-cache dos2unix ca-certificates >/dev/null 2>&1 || true)
RUN dos2unix /opt/sky0cloud/entrypoint.sh /opt/sky0cloud/scripts/ensure-config.sh || true
RUN chmod 750 /opt/sky0cloud/entrypoint.sh /opt/sky0cloud/scripts/ensure-config.sh

ENTRYPOINT ["/opt/sky0cloud/entrypoint.sh"]
CMD ["/usr/local/bin/matrix-conduit", "/etc/conduwuit/conduwuit.toml"]
