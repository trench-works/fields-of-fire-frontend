FROM httpd:alpine

COPY dist/ /usr/local/apache2/htdocs/

COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["httpd-foreground"]