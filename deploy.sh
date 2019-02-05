npx gulp build
rsync -r -a -v -e ssh --delete www/ enpc@ftp.enpc.org:www/foyer/
