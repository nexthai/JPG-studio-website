# JPG studio 网站框架

React + JavaScript 前端，Python 标准库后端。根据两张参考图搭建首页、App 详情页、响应式布局和截图画廊。

## Cloudflare Workers 部署（已添加兼容配置）

线上报错的原因是发布了 `frontend/index.html`，它引用开发入口 `/src/main.jsx`。浏览器不能直接执行 JSX。Workers 必须发布 `frontend/dist` 中经过 Vite 编译的网页，不能把源码文件的 MIME 强行改成 JavaScript。

项目根目录现在包含 `package.json`、`package-lock.json` 和 `wrangler.jsonc`。Wrangler 自动构建前端、核对部署入口，然后只上传 `frontend/dist`，Worker 名称为 `jpg-studio`。

### Cloudflare 控制台连接 Git 仓库

| 设置 | 值 |
| --- | --- |
| 根目录 | 仓库根目录，包含 `wrangler.jsonc`；不要设为 `frontend` 或 `frontend/src` |
| 构建命令 | 留空；`wrangler.jsonc` 的自定义构建会自动执行 `npm run build` |
| 部署命令 | `npm run deploy` |
| Node.js | 22.12+；可将 `NODE_VERSION` 设为 `22` |
| 静态资源目录 | 已在配置中固定为 `./frontend/dist` |

先把本次修改提交到连接的 Git 仓库，再触发 Cloudflare 重新部署。不要沿用上传 `frontend` 源码目录的方式。

### 本地使用 CLI 部署

```bash
cd /Users/yul/Desktop/test/website
npm ci
npx wrangler login
npm run deploy
```

`npm run deploy` 会自动调用构建，无需手动上传目录。登录应使用拥有 `jpg-studio` 的同一 Cloudflare 账号。

### 本地模拟 Workers

```bash
cd /Users/yul/Desktop/test/website
npm ci
npm run preview:cloudflare
```

打开 http://127.0.0.1:8787 。在另一个终端运行：

```bash
cd /Users/yul/Desktop/test/website
npm test
npm run test:cloudflare-runtime
```

不发布线上网站的打包验证：

```bash
npx wrangler deploy --dry-run --outdir .wrangler/dry-run
```

### Python 后端与 Workers 接口

本地仍使用 `backend/server.py`。Workers 使用 `cloudflare/worker.js` 提供相同的 `/api/site` 和 `/api/apps/:slug` 接口，读取同一份 `backend/data/site.json`。Cloudflare 不会启动本项目的 Python HTTP 服务器。

文案、图片或 JSON 修改后需要重新部署；JSON 会随 Worker 打包，线上不依赖你的电脑或 `127.0.0.1:8000`。

官方参考：[静态资源配置](https://developers.cloudflare.com/workers/static-assets/binding/)、[SPA 路由](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)、[Wrangler 自定义构建](https://developers.cloudflare.com/workers/wrangler/custom-builds/)。

## 启动开发模式

需要 Node.js 20.19+（或 22.12+）和 Python 3.10+。

```bash
cd /Users/yul/Desktop/test/website/frontend
npm install
cd ..
python3 run.py
```

打开 http://127.0.0.1:5173 。按 `Ctrl+C` 停止前后端。Python 无需 pip 安装。

## 构建后运行

```bash
cd /Users/yul/Desktop/test/website/frontend
npm run build
cd ..
python3 backend/server.py
```

打开 http://127.0.0.1:8000 。App 详情页可直接访问或刷新，例如 `/apps/dailytodo`。

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 首页：横幅、App 卡片、精选案例、服务介绍、联系区 |
| `/apps/dailytodo` | DailyChecks 介绍、功能、截图、产品信息、下载区 |

名称、文案和产品状态来自参考设计。手机 UI 是 CSS 占位演示，不是实际产品截图。真实下载链接和邮箱为空，页面会显示待补充提示。

## 图片替换

将图片放入 `frontend/public/images/`，按以下文件名保存即可自动替换占位内容，无需修改组件。缺图或加载失败时保留完整占位布局。

| 用途 | 路径（相对于项目根目录） | 推荐比例及内容 |
| --- | --- | --- |
| 首页风景 | `frontend/public/images/home-hero.jpg` | 约 4:1，左侧叠加白色渐变保证文字可读 |
| App 图标 | `frontend/public/images/dailytodo/icon.png` | 1:1，建议 512×512 |
| 详情页右侧大图 | `frontend/public/images/dailytodo/hero.png` | 两台手机组合图，建议透明 PNG、约 1.5:1，完整显示 |
| 首页精选案例背景 | `frontend/public/images/dailytodo/case-study.png` | 约 4.2:1，手机放右侧，左侧留空叠加网站文案 |
| 第一张截图卡片 | `frontend/public/images/dailytodo/screen-1.png` | 约 1.5:1，含截图和卡片内文案的完整图片 |
| 第二张截图卡片 | `frontend/public/images/dailytodo/screen-2.png` | 约 1.5:1，含截图和卡片内文案的完整图片 |
| 第三张截图卡片 | `frontend/public/images/dailytodo/screen-3.png` | 约 1.5:1，含截图和卡片内文案的完整图片 |

其他文件名或格式可在 JSON 配置中修改图片路径。

开发模式：替换图片后刷新即可。构建模式：替换图片后重新运行 `npm run build`。

## 修改文案和链接

编辑 `backend/data/site.json`，然后刷新网页：

- `studio.name`：工作室名称。
- `studio.email`：邮箱；填写后 Contact 弹窗显示邮箱链接。
- `studio.socials`：社交链接，例如 `[{"label":"GitHub","url":"https://github.com/yourname"}]`。
- `home`：首页标题、简介和背景图。
- `home.featuredSlug`：首页精选 App。
- `apps`：名称、简介、标签、功能、截图、状态和图片路径。
- `apps[].storeUrl`：下载或访问链接，空值会显示尚未发布提示。
- `apps[].caseStudy`：精选案例标题与文案。

新增 App：复制一个完整 `apps` 条目，修改唯一 `slug`。首页卡片和详情页会自动生成。图片 URL 以 `/images/` 开头，不包含 `public`。

## 目录

```text
backend/server.py           Python API、静态文件和 React 路由支持
backend/data/site.json      统一内容配置
backend/tests/test_server.py 后端 HTTP 测试
frontend/src/main.jsx       页面与交互
frontend/src/visuals.jsx    图片插槽与手机占位布局
frontend/src/icons.jsx      SVG 图标
frontend/src/styles.css     响应式样式
frontend/public/images/     真实图片放这里
frontend/dist/              构建后的网页
run.py                      开发启动器
```

## 验证命令

```bash
python3 -m unittest discover -s backend/tests -v
cd frontend
npm run build
```

这是展示网站框架；不包含账户、数据库或图片上传后台。内容通过 JSON 文件维护。

当前 DailyChecks 图标使用上传的概念图，`apps[].images.iconCrop: true` 会在网页中裁去外围留白与 Concept A 标签，不修改原图。以后更换为标准正方形图标时，将此值设为 `false` 或删除即可。
# JPG-studio-website

## DailyChecks 隐私政策

- 正式地址：`https://jpg-studio.ha1t1an.workers.dev/apps/dailytodo/privacy`
- App 详情页底部有 `Privacy` 链接。
- HTML 文件：`frontend/public/apps/dailytodo/privacy.html`，构建时复制到 `frontend/dist/apps/dailytodo/privacy.html`。
- 提供的政策正文完整保留，包括原始样式、目录锚点、外部链接、Termly 署名，以及主体名称/邮寄地址的三处 `__________` 占位文字。
- 使用独立 HTML；直接访问不依赖 React 或 `/api/site`，本地 Python 与 Cloudflare Workers 均可访问。
- Workers 名称已按最新正式地址配置为 `jpg-studio`。更新内容后需重新部署。
