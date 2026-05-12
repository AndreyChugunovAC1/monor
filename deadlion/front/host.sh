#!/bin/bash

bun run build
~/.copy_to_server.sh dist/* /var/www/inversedca.ru/deadlion
~/.run_on_server.sh systemctl restart nginx.service