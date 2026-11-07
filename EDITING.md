# 如何编辑这个网站

网站是纯静态的 HTML/CSS/JS，没有构建步骤。把改动 push 到 `main` 分支，GitHub Pages 会自动发布，
通常 1–2 分钟后在 <https://yhli-ml.github.io> 生效（浏览器有缓存的话强制刷新一下）。

## 文件一览

| 文件 | 内容 |
| --- | --- |
| `index.html` | 主页的所有文字：about、currently 卡片、research interests、story 时间线、publications、honors、service |
| `reading.md` | reading 页面的全部笔记，**写随笔只需要改这一个文件** |
| `reading.html` / `reading.js` | reading 页面的结构和逻辑，一般不用动 |
| `style.css` | 颜色、字体、布局 |
| `script.js` | 主页上三个交互小图的逻辑 |

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

注意：reading 页面需要通过上面的本地服务器预览，直接双击打开 `reading.html` 会读不到 `reading.md`。

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

## 改主页上的其他内容

`index.html` 里每一块都有一行醒目的注释，搜索下面的关键字就能找到：

| 想改的内容 | 在 `index.html` 里搜索 |
| --- | --- |
| 顶部导航 | `<nav>` |
| currently 卡片（地点、联系方式等） | `class="card currently"` |
| about 的几段介绍 | `about ───` |
| research interests | `interests ───` |
| story 时间线（每一步一个 `<li class="step">`） | `story ───` |
| 论文列表 | `publications ───` |
| honors / service | `honors & service ───` |

改文字时只动标签中间的内容就好，例如 `<p>这里的文字</p>`。几个常用写法：

```html
<a class="hl" href="https://...">带底色的链接</a>
<a href="https://...">普通链接</a>
<strong>加粗</strong>   <em>斜体</em>
```

**加一篇新论文**：在 `publications` 里复制一个 `<li>…</li>` 整块，改标题、作者、会议和链接：

```html
<li>
  <div class="pub-title">Paper Title</div>
  <div class="pub-authors"><u>Yuhang Li</u>, Coauthor, Advisor</div>
  <div class="pub-venue"><span class="tag">NeurIPS 2027</span>
    <a href="https://...">paper</a> ·
    <a href="https://...">code</a></div>
</li>
```

**在时间线里加一步**：复制一个 `<li class="step">…</li>`，把 `<span class="num">` 里的编号改掉；
没有交互图的话，删掉里面的 `<figure class="demo">…</figure>` 即可。

**更新简历**：简历 PDF 在另一个仓库 `yhli-ml/yhli-ml` 的 `resume/Yuhang_Li_Research_Resume.pdf`。
用同名文件覆盖并 push，网站和 GitHub 主页上的 cv 链接会自动指向新版本。

## 出问题了怎么办

- 改坏了：在 GitHub 上打开文件 → **History**，可以看到每次改动并恢复；或者本地 `git revert <commit>`。
- 网站没更新：看仓库的 **Actions** 页面构建是否成功；再强制刷新浏览器（Mac 上是 `Cmd+Shift+R`）。
