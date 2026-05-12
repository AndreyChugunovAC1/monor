#!/bin/bash

~/.copy_to_server.sh src/ /root/deadlion/back
~/.copy_to_server.sh .env bun.lock package.json tsconfig.json drizzle.config.ts /root/deadlion/back
~/.copy_to_server.sh migrations /root/deadlion/back
~/.run_on_server.sh systemctl restart deadlion-back