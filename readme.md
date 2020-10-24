## 1. HOWTO: deploy this MRE app to your server
### 1.1 install
```
npm install
```

### 1.2 build
```
npm run build
```

### 1.3 set up reverse proxy (https to http)
- take nginx for example, redirects requests from `https://your.domain.name` to `http://localhost:3901`
```
...
server {
    listen 443 ssl;

    server_name piano.illuminati360.xyz;

    ssl_certificate /etc/letsencrypt/live/your.domain.name/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.domain.name/privkey.pem;

    location / {
        proxy_pass http://localhost:3901/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;

        # https to http
        proxy_set_header X-Forwarded-Proto $scheme;

        # proxypassreverse
        proxy_set_header X-Forwarded-Host $host:$server_port;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
...
```

```
service nginx start
```

### 1.4 run
```
WEBSITE_HOSTNAME=<$hostname_of_your_website> npm start
```

## HOWTO: build a MRE app from scratch:

### 1. dev env setup
[typescript](https://khalilstemmler.com/blogs/typescript/node-starter-project/) [eslint](https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/)
```
# install typescript.
# since it's not required by the app we'll use the "save-dev" option
npm install typescript --save-dev

# generate tsconfig.json
npx tsc --init --rootDir src --outDir build \
--esModuleInterop --resolveJsonModule --lib es6 \
--module commonjs --allowJs true --noImplicitAny true

# create root dir
mkdir src

# eslint (parser for typescript)
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# .eslintrc.js
module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ]
}

# .eslintignore
node_modules
dist
```

### 2. hello

```
npm install --save @microsoft/mixed-reality-extension-sdk
```