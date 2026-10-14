# 问卷星（低代码问卷系统）操作指南

一个仿「问卷星」的低代码问卷系统：**创建问卷 → 发布 → 别人填写 → 查看统计**。

## 一、三个"端"分别是什么

"端"就是"给谁用的界面"。这个项目一共三个部分：

| 端 | 通俗解释 | 谁用 | 地址 |
|---|---|---|---|
| **设计端（B端）** | 问卷的"后台"，用来制作和管理问卷 | 问卷创建者（你） | http://localhost:3006 |
| **答题端（C端）** | 问卷的"前台"，用来填写和提交答案 | 填问卷的人 | http://localhost:3000 |
| **服务端** | 后端 API + MongoDB 数据库，两端的数据都存这里 | 不需要直接访问 | http://localhost:3005/api |

- **B端**（Business）：面向"做问卷"的人 —— 登录、创建、编辑、发布、看统计。
- **C端**（Consumer）：面向"填问卷"的人 —— 打开链接直接填，不需要登录。

打个比方：设计端是商家的店铺后台，答题端是顾客看到的店铺页面。

## 二、怎么启动

前置条件：本机 MongoDB 服务已在运行（Windows 服务，端口 27017）。

依次执行（当前已经在后台运行，一般不用重复启动）：

```bash
# 1. 服务端（端口 3005）
#    .env 未提交，需注入 MongoDB 连接信息
cd survey-server
MONGO_HOST=127.0.0.1 MONGO_PORT=27017 MONGO_DATABASE=survey npm run start:dev

# 2. 设计端 B端（端口 3006）
cd ../survey
npm run dev

# 3. 答题端 C端（端口 3000）
cd ../survey-client
npm run dev
```

## 三、设计端怎么用（做问卷的人）

1. 打开 http://localhost:3006 ，注册或登录
   - 现成账号：`demouser01` / `demo123!`
2. 首页点「新建问卷」进入编辑器
3. **编辑器**界面：
   - 左侧：组件面板，把题目类型（单选、多选、输入框等）拖到中间画布
   - 中间：问卷画布，预览效果
   - 右侧：选中某个题目后，在这里改它的属性
   - 顶部：**保存**（Ctrl+S，改动后 3 秒也会自动保存）、**发布**
4. 点「发布」后自动跳转**统计页**：这里有答题链接和二维码，复制发给答题人
5. 回到首页列表，每个问卷可以：
   - **编辑问卷**：继续修改
   - **问卷统计**：查看答题数据（只有已发布的可点）
   - 标星 / 复制 / 删除
   - 列表右侧标签显示「已发布」/「未发布」状态

## 四、答题端怎么用（填问卷的人）

不用登录，直接打开问卷链接即可：

```
http://localhost:3000/question/{问卷id}
```

问卷 id 在设计端统计页的链接里。示例：http://localhost:3000/question/6ace0c59791f10d95e51a3aa

填完点「提交」，答案就存到服务端的 MongoDB 里，设计端的统计页能实时看到。

## 五、本地开发注意事项

仓库代码按 Docker 部署拓扑编写，本地直接跑做了以下适配（如要部署 Docker 请对照恢复）：

1. **服务端**：`.env` 未提交，启动时用命令行注入 `MONGO_HOST / MONGO_PORT / MONGO_DATABASE`（见启动命令）
2. **设计端** [survey/vite.config.ts](survey/vite.config.ts)：`/api` 代理目标从 3305 改为 3005（服务端实际端口）
3. **答题端** [survey-client/next.config.js](survey-client/next.config.js)：新增 `rewrites` 把 `/api/*` 代理到 3005（本地替代 nginx）
4. **答题端** [survey-client/src/consts/index.ts](survey-client/src/consts/index.ts)：问卷接口地址 `survey-server`（Docker 主机名）改为 `localhost`
5. **设计端** [survey/src/consts/answer.ts](survey/src/consts/answer.ts)：统计页问卷链接域名 `answer.yangfei.wiki`（原作者线上域名）改为 `localhost:3000`

## 六、已修复的 bug

**发布后显示未发布**：编辑器 3 秒自动保存会携带过期的 `isPublished: false`，在发布成功后的跳转窗口内把问卷改回未发布。已在 [survey/src/pages/survey/edit/EditHeader.tsx](survey/src/pages/survey/edit/EditHeader.tsx) 修复：保存不再携带发布状态，只有「发布」按钮能改变它。
