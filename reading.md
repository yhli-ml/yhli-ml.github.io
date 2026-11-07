# Reading notes

<!--
这个文件里的每一条「## 标题」就是 reading 页面上的一条笔记。页面会按日期自动排序（新的在上），
所以新笔记写在哪里都可以，习惯上加在这段说明的下面。

复制下面的模板，删掉不需要的行即可：

## 论文 / 文章 / 书的标题
date: 2026-11-07
type: paper
by: Author et al. 2025
link: https://arxiv.org/abs/xxxx.xxxxx

这里写你的随笔，支持 Markdown：**加粗**、*斜体*、[链接](https://example.com)、列表、`代码`、> 引用。
可以写多段，中英文都可以。

说明：
- 只有「## 标题」是必须的，其余都可以省略。
- date 用 YYYY-MM-DD 格式，会计入统计和阅读日历。
- type 是分类，页面上的筛选按钮会根据你用过的 type 自动生成，比如 paper / blog / book / talk / note。不写的话默认是 note。
- by 是作者或来源，link 是原文链接（必须以 http:// 或 https:// 开头）。
- 这对 <!- - 和 - -> 之间的内容不会显示在网页上。
-->

## Co-teaching: Robust Training of Deep Neural Networks with Extremely Noisy Labels
date: 2026-11-07
type: paper
by: Han et al., NeurIPS 2018
link: https://arxiv.org/abs/1804.06872

（示例笔记）带噪标签学习的经典工作。核心观察是：深度网络会**先拟合干净样本、后记住噪声样本**，
所以训练早期 loss 小的样本更可能是干净的。

Co-teaching 同时训练两个网络，每个 mini-batch 里各自挑出 small-loss 的样本，**交给对方**更新参数。
两个网络的错误不完全相同，交叉筛选可以减少单个网络「自己确认自己错误」的累积。

- 筛选比例随训练逐步减小到 1 − 噪声率，所以需要事先估计噪声率。
- 在长尾数据上，尾部类的干净样本 loss 本身就偏大，small-loss 准则容易把它们误当成噪声，
  这是和我 ICCV 2025 工作相关的一个问题。

## The Bitter Lesson
date: 2026-11-06
type: blog
by: Rich Sutton, 2019
link: http://www.incompleteideas.net/IncIdeas/BitterLesson.html

(Example note.) A short essay arguing that, over 70 years of AI research, general methods that
**scale with computation** (search and learning) have consistently beaten approaches that build in
human knowledge about the domain.

Why "bitter": building in our own understanding helps in the short term, but it tends to plateau,
and the eventual breakthrough comes from the opposite approach.

Worth rereading when designing methods: which parts of an idea will still matter when the model
and the data are 100× larger?
