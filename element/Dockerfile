FROM vectorim/element-web:latest

USER root
WORKDIR /opt/sky0cloud

# Copy files relative to the build context (./element)
COPY entrypoint.sh /opt/sky0cloud/entrypoint.sh

# Copy shared files from parent directory
COPY ../scripts/ensure-config.sh /opt/sky0cloud/scripts/ensure-config.sh
COPY ../config/default.config.json /opt/sky0cloud/config/default.config.json

RUN (apk add --no-cache bash dos2unix ca-certificates >/dev/null 2>&1 || true)
RUN dos2unix /opt/sky0cloud/entrypoint.sh /opt/sky0cloud/scripts/ensure-config.sh || true
RUN chmod 750 /opt/sky0cloud/entrypoint.sh /opt/sky0cloud/scripts/ensure-config.sh

ENTRYPOINT ["/opt/sky0cloud/entrypoint.sh"]
CMD ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]
