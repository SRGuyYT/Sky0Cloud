FROM matrixconduit/matrix-conduit:latest

WORKDIR /opt/sky0cloud

# Copy only files that exist inside the conduwuit build context
COPY entrypoint.sh /opt/sky0cloud/entrypoint.sh
COPY scripts/ensure-config.sh /opt/sky0cloud/scripts/ensure-config.sh
COPY config/default.config.json /opt/sky0cloud/config/default.config.json

RUN dos2unix /opt/sky0cloud/entrypoint.sh /opt/sky0cloud/scripts/ensure-config.sh || true
RUN chmod 750 /opt/sky0cloud/entrypoint.sh /opt/sky0cloud/scripts/ensure-config.sh || true

ENTRYPOINT ["/opt/sky0cloud/entrypoint.sh"]
CMD ["/usr/local/bin/matrix-conduit", "/etc/conduwuit/conduwuit.toml"]
