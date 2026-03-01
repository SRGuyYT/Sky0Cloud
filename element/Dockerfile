FROM vectorim/element-web:latest
WORKDIR /opt/sky0cloud

COPY --chmod=0750 --chown=1000:1000 entrypoint.sh /opt/sky0cloud/entrypoint.sh

# Base template used by the entrypoint to create the runtime config
COPY --chown=1000:1000 config.json /opt/sky0cloud/config.default.json

ENTRYPOINT ["/opt/sky0cloud/entrypoint.sh"]
CMD ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]
