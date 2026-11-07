# 如何编辑这个网站

网站是纯静态的 HTML/CSS/JS，没有构建步骤。把改动 push 到 `main` 分支，GitHub Pages 会自动发布，
通常 1–2 分钟后在 <https://yhli-ml.github.io> 生效（浏览器有缓存的话强制刷新一下）。

## 文件一览

| 文件 | 内容 |
| --- | --- |
| `home.md` | 主页的全部文字：about、currently 卡片、research interests、story 时间线、publications、honors、service，**改主页只需要改这一个文件** |
| `index.html` / `home.js` | 主页的外壳、三张交互图的结构和把 `home.md` 变成网页的逻辑，一般不用动 |
| `reading.md` | reading 页面的全部笔记，**写随笔只需要改这一个文件** |
| `reading.html` / `reading.js` | reading 页面的结构和逻辑，一般不用动 |
| `style.css` | 颜色、字体、布局 |
| `script.js` | 主题切换和三张交互图的逻辑 |
| `vendor/marked.min.js` | 把 Markdown 转成网页的小程序库，不用动 |

## 三种编辑方式

### 1. 在 GitHub 网页上直接改（最方便，手机也行）

1. 打开 <https://github.com/yhli-ml/yhli-ml.github.io>，点开要改的文件（比如 `reading.md`）。
2. 点右上角的铅笔图标 ✏️ 编辑。
3. 改完点 **Commit changes…** → 再点一次 **Commit changes**。
4. 等 1–2 分钟，网站自动更新。可以在仓库的 **Actions** 标签页看到 `pages build and deployment` 是否完成。

小技巧：在仓库页面按键盘上的 `.`（句号），会打开一个网页版 VS Code（github.dev），适合一次改多个文件。
手机上用 GitHub App 也能编辑并提交。

### 2. 在本地改，先预览再发布

```sh
cd ~/work/projects/yhli-ml.github.io
git pull                                # 先同步网页上做过的改动
python3 -m http.server 8124             # 预览：浏览器打开 http://localhost:8124
# …编辑文件，刷新浏览器查看效果，Ctrl+C 停止预览…
git add -A
git commit -m "Add reading note"
git push
```

注意：主页和 reading 页面都需要通过上面的本地服务器预览，直接双击打开 HTML 文件会读不到 `.md` 文件。

### 每天 23:00 自动发布（本机）

这台 Mac 上设置了一个定时任务：**每天 23:00** 自动把本地仓库里的所有改动 commit 并 push。
所以在本地改完可以不用管，当晚会自动上线；想马上发布的话，照常手动 push 即可。

- 它会先同步 GitHub 网页上做过的改动；如果两边改了同一处导致冲突，它会放弃这次 push，
  你需要手动运行 `git pull --rebase` 解决。
- **到点时所有未提交的改动都会公开**，写到一半、还不想发布的内容，请先放在仓库外面。
- 如果 23:00 时 Mac 在睡眠，会在唤醒后补跑一次；关机时则跳过当天。
- 运行记录：`~/Library/Logs/yhli-site-autopush.log`
- 脚本：`~/.local/bin/yhli-site-autopush.sh`；定时配置：`~/Library/LaunchAgents/io.github.yhli-ml.site-autopush.plist`
- 立即手动运行一次：`launchctl kickstart gui/$(id -u)/io.github.yhli-ml.site-autopush`
- 关闭：`launchctl bootout gui/$(id -u)/io.github.yhli-ml.site-autopush`，然后删除上面的 plist 文件。
- 改时间：编辑 plist 里的 `Hour` / `Minute`，再先 bootout、后 `launchctl bootstrap gui/$(id -u) <plist 路径>`。

### 3. 让 Claude 改

直接说「在 reading 里加一条关于 XXX 的笔记」或者「把 about 第二段改成……」即可。

## 写一条 reading 随笔

在 `reading.md` 里加一段（放在文件开头说明的下面即可，页面会按日期自动排序）：

```markdown
## 论文 / 文章 / 书的标题
date: 2026-11-07
type: paper
by: Author et al. 2025
link: https://arxiv.org/abs/xxxx.xxxxx

随笔正文，支持 Markdown：**加粗**、*斜体*、[链接](https://example.com)、列表、> 引用。
可以写多段，中英文都可以。
```

- 只有 `## 标题` 是必须的，其余几行都可以省略。
- `date` 用 `YYYY-MM-DD`，会计入统计和阅读日历。
- `type` 是分类（paper / blog / book / talk / note…），筛选按钮按你用过的 type 自动生成；不写默认是 note。
- 每条笔记都有自己的链接，例如 `https://yhli-ml.github.io/reading.html#标题转成的id`，展开后点右侧的 `#` 就能得到。

## 改主页上的内容

主页的文字全部在 `home.md` 里，可以用 Typora 直接编辑。文件开头的注释里也有一份写法速查。

**板块**：每个「# 标题」是一个板块。普通段落、**加粗**、*斜体*、[链接](https://...)、列表照常写。

| 写法 | 效果 |
| --- | --- |
| `==文字==` | 带底色的高亮（about 板块里的链接会自动高亮） |
| 一行只有链接、用 ` · ` 隔开 | 一排圆角按钮（about 末尾那排） |
| about 里以 `> currently` 开头的引用块 | 右侧那张 currently 小卡片，每行写 `名称: 内容` |
| 正文里的 `(!)` | 自动显示成强调色 |
| honors / service 列表里写 `左侧小字 · 内容` | 左侧小字显示在上方的灰色小标题 |

**时间线（the story so far）和论文列表（publications）**：每个「## 标题」是一条，标题下面紧跟几行属性，空一行后写正文。

```markdown
## 新的一步的标题
venue: NeurIPS 2027 · first author
paper: https://...
code: https://...

这一步的正文……
```

| 属性 | 作用 |
| --- | --- |
| `venue:` | 时间线里标题下的小字；论文列表里是会议标签（写 under review 会显示成灰色） |
| `paper:` / `code:` | 论文和代码链接。只写网址会显示默认文字；想自定义就写 `[自定义文字](网址)` |
| `figure:` | 插入交互图：`complementary-labels` / `long-tail` / `kv-cache` |
| `status: ongoing` | 编号圆圈显示为虚线，表示进行中 |
| `note:` | 正文下面的一行灰色小字 |
| `authors:` | 论文作者，用 `**Yuhang Li**` 标出自己，会显示成下划线 |

时间线的编号按顺序自动生成。**加一篇论文**：在 publications 下面复制一整条 `## …` 改内容即可。

**更新简历**：简历 PDF 在另一个仓库 `yhli-ml/yhli-ml` 的 `resume/Yuhang_Li_Research_Resume.pdf`。
用同名文件覆盖并 push，网站和 GitHub 主页上的 cv 链接会自动指向新版本。

## 出问题了怎么办

- 改坏了：在 GitHub 上打开文件 → **History**，可以看到每次改动并恢复；或者本地 `git revert <commit>`。
- 网站没更新：看仓库的 **Actions** 页面构建是否成功；再强制刷新浏览器（Mac 上是 `Cmd+Shift+R`）。
