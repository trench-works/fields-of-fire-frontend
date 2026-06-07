FROM httpd:2.4

# Active this only when https an domain cert is available

# RUN sed -i \
#     '/#LoadModule ssl_module/s/^#//g' \
#     /usr/local/apache2/conf/httpd.conf

# RUN echo "Include conf/extra/httpd-ssl.conf" \
#     >> /usr/local/apache2/conf/httpd.conf

# RUN echo "LoadModule proxy_module modules/mod_proxy.so" \
#     >> /usr/local/apache2/conf/httpd.conf

# RUN echo "LoadModule proxy_http_module modules/mod_proxy_http.so" \
#     >> /usr/local/apache2/conf/httpd.conf

COPY dist/ /usr/local/apache2/htdocs/

COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["httpd-foreground"]