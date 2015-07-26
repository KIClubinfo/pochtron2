Foyer
=====

Admin app for the Foyer club of the _École nationale des ponts et chausées_. It features an AngularJS front-end powered by the [uPont](https://github.com/KIClubinfo/uPont) Symfony2 REST API.

[http://foyer.enpc.org]

Installation
------------
Requirements: NPM, Ansible (`sudo apt-get install nodejs npm python python-dev && sudo pip install ansible`).
```
npm install
npm start
```

Now you should be able to access the application in your Web browser on [http://localhost:9001].

Deployment
----------

```
ssh -A claude@vps.enpc.org
cd /var/www/foyer.enpc.org
git pull
npm install
exit
```
