FROM matrixconduit/matrix-conduit:latest

WORKDIR /opt/sky0cloud

COPY --chown=1000:1000 entrypoint.sh /opt/sky0cloud/entrypoint.sh
COPY --chown=1000:1000 scripts/ensure-config.sh /opt/sky0cloud/scripts/ensure-config.sh

RUN chmod +x /opt/sky0cloud/entrypoint.sh \
    && chmod +x /opt/sky0cloud/scripts/ensure-config.sh

ENTRYPOINT ["/opt/sky0cloud/entrypoint.sh"]

CMD ["/usr/local/bin/matrix-conduit"]
