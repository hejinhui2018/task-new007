# 领航学院 · 企业培训门户（断点续学）

面向企业培训场景的「断点续学」学习页面。员工从课程目录进入章节、测验或讲义后，无论浏览器前进/后退、刷新页面还是返回目录，路由、模态状态、滚动位置和焦点都能恢复到合理的位置，不会丢失上下文。

技术栈：**React 18 + TypeScript + Vite + React Router v6**，内容为本地示例数据（《信息安全意识培训》，三章讲义 + 一份带未提交草稿的结业测验）。

## 运行方式

```bash
npm install        # 安装依赖
npm run dev        # 开发服务器（默认 http://localhost:5173）
npm test           # 运行全部测试（vitest + Testing Library）
npm run build      # 类型检查 + 生产构建（输出到 dist/）
npm run preview    # 预览生产构建（默认 http://localhost:4173）
```

## 功能与交互

- **课程目录 `/`**：课程信息、学习进度、「继续学习」按钮（恢复上次章节的阅读位置）、章节列表（进入章节 = 整页，预览 = 模态层）、结业测验卡片（显示草稿进度）。
- **章节阅读 `/chapter/:chapterId`**：讲义正文、上一章/下一章、标记完成、「开始测验」打开抽屉；支持直接访问（深链）。
- **章节预览模态**：目录点「预览」以模态层打开，URL 同步为章节地址，目录保持在背景中；可 Esc / 点击遮罩关闭，也可「打开完整章节」。
- **测验抽屉 `/chapter/:chapterId/quiz`**：右侧抽屉，未提交的作答实时自动保存（localStorage），刷新、关闭再打开都不丢；提交后显示得分与逐题解析，可重新作答。
- **失败导航**：不存在的章节或未知路径会 `replace` 回目录并提示，失效地址不留在历史栈中，后退不会回到坏页面。

## 关键实现

### 历史栈与路由结构

- 模态层通过导航 state 中的 `backgroundLocation` 实现：从目录打开预览时把目录 location 存入 state，App 同时渲染背景路由（目录）与前景模态；直接访问章节 URL 时没有该 state，自然渲染为完整章节页。
- 测验抽屉是章节页的子路由（`/chapter/:chapterId/quiz`），打开 = PUSH，关闭 = 后退一步；深链进入的抽屉关闭时 `replace` 回章节页，不产生多余历史。
- 失败导航（章节不存在、未知路径）渲染 `<Navigate replace>`，失效条目被替换掉，不会污染上一页的历史。

### 滚动与焦点恢复（`src/restoration.tsx`）

- 关闭浏览器原生滚动恢复（`history.scrollRestoration = 'manual'`），自行管理。
- 滚动位置按**历史条目 key** 和**路径**双份存储（sessionStorage）：
  - 前进/后退（POP）→ 按条目 key 精确恢复；
  - 整页刷新 → 首个条目按路径兜底恢复；
  - 「继续学习」→ 按路径恢复到上次阅读位置；
  - 打开抽屉/模态（带 `overlay` 标记的导航）→ 保持底层滚动不动。
- 焦点按条目 key 记录最后聚焦的可交互元素（`data-focus-id`），POP 回来时恢复；覆盖层内部的焦点不记录，模态/抽屉打开时自动聚焦关闭按钮，关闭后焦点回到触发元素。

### 进度与草稿（`src/store/progress.ts`）

- localStorage 持久化：已完成章节、上次学习位置、测验状态（草稿/已提交、答案、得分）。
- 内置初始进度：第一章已完成、上次学到第二章、测验带两份未提交的草稿答案（q1、q3），方便直接体验「断点续学」。
- 写入时总是基于存储中的最新值合并，章节页与抽屉同时挂载也不会互相覆盖。

## 测试（`src/__tests__/`，共 17 个用例）

| 文件 | 覆盖点 |
| --- | --- |
| `history-stack.test.tsx` | 目录 → 章节 → 抽屉的压栈/出栈，前进后退后 URL 与页面一致；标记完成回目录可见；返回目录 |
| `modal-routing.test.tsx` | 预览模态与背景目录共存、Esc 关闭、模态→整页→后退；深链渲染整页；带模态状态的条目恢复后仍是模态 |
| `scroll-focus.test.tsx` | 前进/后退按条目恢复滚动、整页刷新恢复滚动、后退恢复焦点、模态焦点进出 |
| `failed-navigation.test.tsx` | 失效章节 replace 回目录并提示、后退不回到坏地址、深链失效章节、未知路径 |
| `quiz-draft.test.tsx` | 预置草稿渲染、刷新后草稿保留、深链抽屉关闭不污染历史、提交出分与重新作答 |

## 目录结构

```
src/
├── data/course.ts          # 课程、三章讲义、测验题（本地示例数据）
├── store/progress.ts       # localStorage 进度与测验草稿
├── restoration.tsx         # ScrollManager / FocusManager（滚动与焦点恢复）
├── hooks/useProgress.ts    # 进度读写 hook
├── components/             # 布局、章节正文
├── pages/                  # 目录、章节页、章节模态、测验抽屉
├── App.tsx                 # 路由结构（背景层 + 模态层）
└── __tests__/              # 测试
```
