#!/bin/bash
ssh -tA claude@vps.enpc.org 'cd /var/www/foyer.enpc.org && git pull && npm install'
