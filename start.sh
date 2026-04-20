#!/bin/bash
cd /home/z/my-project
while true; do
  node .next/standalone/server.js </dev/null 2>/dev/null
  sleep 2
done
