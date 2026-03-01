FROM vectorim/element-web:latest

USER root
RUN (apk add --no-cache bash dos2unix ca-certificates >/dev/null 2>&1 || true)
WORKDIR /opt/sky0cloud
COPY ./element/entrypoint.sh /opt/sky0cloud/entrypoint.sh
COPY ./scripts/ensure-config.sh /opt/sky0cloud/scripts/ensure-config.sh
COPY ./config/default.config.json /opt/sky0cloud/config/default.config.json
COPY ./config/default.config.json /opt/config/default.config.json
RUN dos2unix /opt/sky0cloud/entrypoint.sh /opt/sky0cloud/scripts/ensure-config.sh || true
RUN chmod 750 /opt/sky0cloud/entrypoint.sh /opt/sky0cloud/scripts/ensure-config.sh
ENTRYPOINT ["/opt/sky0cloud/entrypoint.sh"]
CMD ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]
