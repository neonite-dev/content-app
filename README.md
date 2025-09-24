# 멀티 디바이스 컨텐츠
#### [<< back](../README.md)

## 초기셋팅 스타터 프로젝트

[[nuxt2-Starter]](https://git-pms.milkt.co.kr/servicedev4/nuxt2-starter) starter project template - base로 구성 후 개발

```
- Tab 10.1 / Tab A6 Version - Chrome 59 호환성을 위해 NUXT 2.x 버전을 사용 (webpack, babel 컴파일을 적용해야 es5를 지원)

- 신규 Application 개발 시 브라우져 및 Tab 지원여부에 따라 NUXT 3.X 개발로 마이그레이션 진행 (vite 컴파일 es6 이상)

- Nuxt2 + TypeScript + composition-api + Pinia + Axios + Proxy + es2015 + ie11 + tab10.1 Starter 

- version Nuxt 2.17.2, Node 18.15.0
```

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# 로컬 개발시 .env 환경변수 참조용 - hostname은 pc 설정에 맞게 변경 (package.json)
$ npm run dev:local

# build for production and launch server (docker 셋팅이 필요할 경우 사용할것)
$ npm run build
$ npm run start

# 로컬 개발시 .env.local 환경변수 참조
$ npm run build:local
# 개발서버 배포시 .env.dev 환경변수 참조
$ npm run build:dev
# 스테이징서버 배포시 .env.stage 환경변수 참조
$ npm run build:stage
# 운영서버 배포시 .env.production 환경변수 참조
$ npm run build:live

```

- [package](./package.json) 상세
  - 최초 개발 실행시 npm run dev 을 수행할 경우 install 동시 진행
  - @nuxtjs/dotenv를 통해 서버별 분기처리
  - copyfiles를 통해 deploy 목록만 재정의

```JSON
{
  // 최초 개발 실행시 npm run dev
  "dev": "npm i && nuxt --dotenv .env.local --open",
  // 로컬 개발 진행 시 hostname을 지정 - 개발시 개별 추가/수정 
  "dev:local": "npm i && nuxt --hostname=local-pilot.milkt.co.kr --dotenv .env.local --open",
  // 운영서버 빌드
  "build": "npm run clean && npm i && nuxt build --dotenv .env.production && npm run deploy:nuxt && npm run deploy:server && npm run deploy:config && npm run deploy:install",
  // 개발서버 빌드
  "build:dev": "npm run clean && npm i && nuxt build --dotenv .env.development && npm run deploy:nuxt && npm run deploy:server && npm run deploy:config && npm run deploy:install",
  // 테스트서버 빌드 및 별도 테스트 진행
  "build:test": "npm run clean && npm i && nuxt build --dotenv .env.test && npm run deploy:nuxt && npm run deploy:server && npm run deploy:config && npm run deploy:install",
  // 로컬 IIS 셋팅 시 배포 테스트를 위해 수행
  "build:local": "npm run clean && npm i && nuxt build --dotenv .env.local && npm run deploy:nuxt && npm run deploy:server && npm run deploy:config && npm run deploy:install",
  "start": "nuxt start",
  "generate": "nuxt generate",
  "lint": "eslint --max-warnings 0 --ext .ts,.vue .",
  "clean": "node ./tasks/clean.js",
  "deploy:nuxt": "copyfiles -u 1 ./.nuxt/**/*.* ../deploy/.nuxt",
  "deploy:server": "copyfiles -a ./server/**/*.* ../deploy/ && copyfiles -a ./api/**/*.* ../deploy/ && copyfiles -a ./router.js ../deploy/ && copyfiles -a ./static/js/*.* ../deploy/ && copyfiles -a ./static/css/*.* ../deploy/ ",
  "deploy:config": "copyfiles -a ./web.config ../deploy/ && copyfiles -a ./nuxt.config.js ../deploy/ && copyfiles -a ./package.json ../deploy/ && copyfiles -a ./.env.* ../deploy/ ",
  "deploy:install": "cd.. && cd deploy && npm install"
}
```


작동 방식에 대한 자세한 설명은 다음을 확인하세요. [documentation](https://nuxtjs.org).

## Special Directories

다음과 같은 추가 디렉터리를 생성할 수 있으며 그 중 일부는 특별한 동작을 가집니다. `pages`만 필수입니다. 해당 기능을 사용하지 않으려면 삭제할 수 있습니다.

### `assets`

assets 디렉터리에는 Stylus 또는 Sass 파일, 이미지 또는 글꼴과 같은 컴파일되지 않은 assets이 포함되어 있습니다.

이 디렉토리의 사용법에 대한 자세한 내용은 [the documentation](https://v2.nuxt.com/docs/directory-structure/assets).

### `api`

api 디렉터리에는 typescript + axios를 이용한 api 호출 함수를 제공합니다.

### `components`

구성 요소 디렉터리에는 Vue.js 구성 요소가 포함되어 있습니다. 구성 요소는 페이지의 다양한 부분을 구성하며 페이지, 레이아웃 및 기타 구성 요소로 재사용하고 가져올 수 있습니다.

이 디렉토리의 사용법에 대한 자세한 내용은 [the documentation](https://v2.nuxt.com/docs/directory-structure/components).

### `composables`

hook을 사용할 경우 파일을 정의 합니다. use- 로 구분합니다.

### `layouts`

레이아웃은 사이드바를 포함하거나 모바일 및 데스크톱에 대한 고유한 레이아웃을 갖고 싶은지 여부에 관계없이 Nuxt 앱의 모양과 느낌을 변경하려는 경우 큰 도움이 됩니다.

이 디렉토리의 사용법에 대한 자세한 내용은 [the documentation](https://v2.nuxt.com/docs/directory-structure/layouts).

### `pages`

이 디렉터리에는 애플리케이션 보기와 경로가 포함되어 있습니다. Nuxt는 이 디렉터리 내의 모든 `*.vue` 파일을 읽고 Vue Router를 자동으로 설정합니다.

이 디렉토리의 사용법에 대한 자세한 내용은 [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

플러그인 디렉토리에는 루트 Vue.js 애플리케이션을 인스턴스화하기 전에 실행하려는 JavaScript 플러그인이 포함되어 있습니다. 이곳은 Vue 플러그인을 추가하고 함수나 상수를 삽입하는 곳입니다. `Vue.use()`를 사용해야 할 때마다 `plugins/`에 파일을 생성하고 `nuxt.config.js`에 플러그인 경로를 추가해야 합니다.

이 디렉토리의 사용법에 대한 자세한 내용은 [the documentation](https://v2.nuxt.com/docs/directory-structure/plugins).

### `server`

서버구동 설정에 대한 정의를 합니다.

### `static`

이 디렉터리에는 정적 파일이 포함되어 있습니다. 이 디렉터리 내의 각 파일은 `/`에 매핑됩니다.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

이 디렉토리의 사용법에 대한 자세한 내용은 [the documentation](https://v2.nuxt.com/docs/directory-structure/static).

### `store`

이 디렉터리에는 Vuex 저장소 파일이 포함되어 있습니다. 이 디렉터리에 파일을 생성하면 Vuex가 자동으로 활성화됩니다.

이 디렉토리의 사용법에 대한 자세한 내용은 [the documentation](https://v2.nuxt.com/docs/directory-structure/store).


### `tasks`

빌드 및 배포에 필요한 정의를 합니다. [clean.js](./tasks/clean.js)를 통해 디렉토리 초기화를 합니다.

### `types`

typescript에 정의 된 interface를 설정 합니다.

### `utils`

공통 파일 참조에 대한 utility를 정의 합니다.

## 개발가이드
- Tab 10.1 / Tab A6 Version - Chrome 59 호환성을 위해 NUXT 2.x 버전을 사용 (webpack, babel 컴파일을 적용해야 es5를 지원)
- Rendering 방식은 Universal(Server Side Rendering + Client Side Rendering)로 적용
- 서비스 최초 접속시 SSR방식으로 화면이 렌더링, 이후 화면 전환은 CSR 방식으로 진행
- 개발 시 서버 디버깅은 지정 후 중단점 설정 후 F5키의 fullstack: nuxt 를 설정 후 사용
- api 항목 및 컨텐츠에 대한 참조는 proxy 설정으로 크로스도메인 CORS(Cross-Origin Resource Sharing) 방지

1. [pages](./pages/README.md) 하위에 Route 될 폴더 추가 및 index.vue 생성 (자동 라우팅)
    - publishing 될 html 반영 
    - 페이지별 head() 속성 정의 (meta, link, script)
    - 재사용/반복사용이 가능한 모듈에 대해 components로 분리하여 개발
    - 최초 로드시 server/client data 비동기 호출 시 asyncData를 사용
    
2. `components` Route 될 폴더 추가
    - Base: PageBase -> mixin으로 사용 필요시 Route명 + PageBase.vue로 생성
    - Common: 공통 Component 재사용을 위해 사용
    - Route명: 모듈별 사용구분
    - 최초 로드시 server/client data 비동기 호출 시 fetch 를 사용
3. `store` Route 될 js 파일 추가
    - index.js 의 nuxtServerInit 을 서버호출시 가장 먼저 실행
    - index.js 의 nuxtClientInit은 클라이언트 호출시 가장 먼저 실행, 필요할 경우 별도 정의
    - flux 패턴에 의해 Action -> Dispatcher -> Store -> View 순환 Store 변경 시 Dispatcher 활용 권장
4. `.env` 서버별 환경변수 필요 시 추가 (로컬, 개발, 스테이징, 운영)
5. `web.config` IIS를 연계해서 사용하므로 환경변수와 동일 설정 가능(환경변수 상위)
    - 운영 플래그 production은 빌드 사용자 오류방지를 위해 live로 임의 지정(참고)
    - appSettings > ServerMode로 nuxt.config.js 기본구분
6. `nuxt.config.js` 
    - 기본 사용법은 [Nuxt configuration file 참고](https://v2.nuxt.com/docs/directory-structure/nuxt-config)
    - debug: 수행시 임의 변경 후 사용
    - script: 전역 공통 정적 js파일 사용 시 추가 그외 page 정의
    - plugins: 전역 공통 plugin 적용시 해당폴더 경로 이용
    - env: process.env 맵핑 정의
    - axios: plugins/axios_module 정의 되어있으나 page별 api 분기시 일괄수정 불편함으로 api 폴더 이용
    - proxy: axios 사용시 사용가능 커스터마이징을 위해 serverMiddleware 사용
    - serverMiddleware: api proxy 정의
    - build: filenames는 캐쉬방지를 위해 hash적용 개발시 수정가능
    - router: base 설정은 napps로 지정 (호스트명/napps)
    
7. 기타 파일 정의
    - [.babelrc](./.babelrc) @babel/preset-env 정의를 위해 설정합니다.
    - [.env](./.env.production) @nuxtjs/dotenv를 참조하여 서버별 환경변수를 분기 합니다.(.local, .development, .staging, .production)
    - [.eslintrc](./.eslintrc) eslint에 대한 설정을 합니다.
    - [.gitignore](./.gitignore) git commit 예외 파일을 설정 합니다.
    - [.prettierrc](./.prettierrc) prettier 를 통한 vscode의 개발 환경 설정을 합니다.
    - [.prettierignore](./.prettierignore) prettier 가 적용되지 않아야하는 예외파일을 설정을 합니다.
    - [jsconfig.json](./jsconfig.json) vue config 설정을 추가 합니다.
    
#### [<< back](../README.md)  |  [pages 로 이동 >>](./pages/README.md)