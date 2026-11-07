<!--
这是主页（https://yhli-ml.github.io）的全部文字。改完保存即可，当晚 23:00 自动发布。
<!- - 和 - -> 之间的内容是注释，不会显示在网页上。写法速查：

- 「# 标题」开始一个新板块（about、research interests、the story so far、publications、honors、service）。
- 普通段落、**加粗**、*斜体*、[链接](https://...)、列表照常写。
- ==文字== 显示成带底色的高亮（about 板块里的链接会自动高亮）。
- 只由链接组成、用 · 隔开的一行，会显示成一排圆角按钮（见 about 末尾）。
- about 里以「> currently」开头的引用块是右侧那张小卡片，每行「名称: 内容」。
- 时间线和论文列表里，每个「## 标题」是一条，标题下面紧跟的「名称: 内容」行是属性：
    venue:   时间线里标题下的小字；论文列表里是会议标签（写 under review 会显示成灰色）
    paper:   论文链接；可以只写网址，也可以写 [自定义文字](网址)
    code:    代码链接，写法同上
    figure:  插入交互图，可选 complementary-labels / long-tail / kv-cache
    status:  写 ongoing 时，编号圆圈显示为虚线（表示进行中）
    note:    正文下面的一行灰色小字
    authors: 论文作者，用 **Yuhang Li** 标出自己，会显示成下划线
- 正文里的 (!) 会自动显示成强调色。
- honors / service 里每一项写成「左侧小字 · 内容」。
-->

# about

> currently
> location: ==Tokyo, Japan==
> at: [Sugiyama Lab, UTokyo](https://www.ms.k.u-tokyo.ac.jp/sugi/)
> thinking about: ==reliable learning from imperfect labels==
> contact: [albertl06011@gmail.com](mailto:albertl06011@gmail.com)

I am a first-year Ph.D. student in Complexity Science and Engineering at the [Graduate School of Frontier Sciences](https://www.k.u-tokyo.ac.jp/en/), [The University of Tokyo](https://www.u-tokyo.ac.jp/en/), advised by [Prof. Masashi Sugiyama](https://www.ms.k.u-tokyo.ac.jp/sugi/). I study **trustworthy machine learning and foundation models**: how to make models that keep working when the supervision they are given is weak, noisy, or badly unbalanced. For a full list of my work, see my [Google Scholar profile](https://scholar.google.com/citations?user=taHXmsoAAAAJ&hl=en) or scroll further down this page.

I have been provisionally selected for the **JSPS DC1 Research Fellowship** (FY2027) and **BOOST NAIS** at the University of Tokyo; both appointments are pending.

Before starting my Ph.D., I was a student trainee in the Imperfect Information Learning Team at [RIKEN AIP](https://aip.riken.jp/), working on weakly supervised learning with foundation models under long-tailed distributions and noisy labels. I then spent a few months as a research intern at ==Huawei 2012 Laboratories==, building KV-cache prefetching for long-context LLM inference in [vLLM](https://github.com/vllm-project/vllm) and [LMCache](https://github.com/LMCache/LMCache).

I received my M.Eng. in Computer Science and Technology from ==Southeast University==, advised by ==Prof. Yuheng Jia== in the PAttern Learning and Mining (PALM) Lab, where I wrote my first two first-author papers (ICLR 2025, ICCV 2025). Before that, I earned my B.Eng. in Computer Science and Technology at ==Dalian University of Technology==.

[résumé](https://github.com/yhli-ml/yhli-ml/blob/main/resume/Yuhang_Li_Research_Resume.pdf) · [scholar](https://scholar.google.com/citations?user=taHXmsoAAAAJ&hl=en) · [github](https://github.com/yhli-ml) · [linkedin](https://www.linkedin.com/in/yuhang-li-7782b5361/) · [email](mailto:albertl06011@gmail.com)

# research interests

Real-world labels are rarely clean, complete, or balanced. My goal is to understand what a model can still learn reliably from such data, and to carry those guarantees over to foundation models. I organize this around three threads.

- **Weak supervision**: learning when labels only say what something is *not*, or give a set of possible answers instead of one (complementary and partial-label learning).
- **Robustness to imperfect data**: long-tailed class distributions and noisy labels, especially when the two occur together and the rare classes are the ones most corrupted.
- **Reliable foundation models**: bringing these ideas to large pretrained models, from how they are adapted to how they are served efficiently.

# the story so far

*What I've worked on so far, in the order it happened.*

## Complementary labels
venue: ICLR 2025 · first author
paper: https://proceedings.iclr.cc/paper_files/paper/2025/hash/95b6e2ff961580e03c0a662a63a71812-Abstract-Conference.html
code: https://github.com/yhli-ml/PLNL
figure: complementary-labels

In complementary-label learning, each training example only comes with a class it does *not* belong to. With a single such label per image and ten classes, nine candidates remain, so the signal is very weak. PLNL treats this as an inverse problem: it **guesses a likely positive label** and **enhances the negative labels** to recover a much richer training signal. (!) On STL-10 with one complementary label per example, accuracy rose to 55.25%, versus 34.96% for the previous best (POCR).

## Long tails meet noisy labels
venue: ICCV 2025 · first author
paper: https://openaccess.thecvf.com/content/ICCV2025/html/Li_Boosting_Class_Representation_via_Semantically_Related_Instances_for_Robust_Long-Tailed_ICCV_2025_paper.html
code: https://github.com/yhli-ml/IBC
figure: long-tail

When a dataset is both long-tailed and noisily labeled, the rare (tail) classes suffer twice: they have few examples to begin with, and noise corrupts a large share of those few, so rare-but-clean samples are easy to mistake for mislabeled ones. IBC strengthens the class representations by **transferring semantic soft labels from related instances** and combining **shot-specific experts** for head, medium, and tail classes. (!) On CIFAR-10 with 50% label noise and imbalance ratio 200: 69.80% top-1 accuracy, versus 64.81% for SFA.

## Samples are not equal; head and tail cooperate
venue: ICLR 2026 · co-author / under review · first student author
paper: [read the ICLR 2026 paper →](https://proceedings.iclr.cc/paper_files/paper/2026/file/63ef323523f3be8b58ed9277cc747485-Paper-Conference.pdf)
code: https://github.com/notoaudrey/Samples-Are-Not-Equal

Two follow-ups on the same theme. In *deep clustering*, models tend to over-learn simple patterns in dense regions of feature space. Our plug-in initializes the clustering head in a density-aware way and **dynamically selects samples**, dropping ones that are already learned and focusing on unstable ones. This improves clustering accuracy by up to 6.1% and speeds up training by up to 1.3×. In *long-tailed partial-label learning*, each example has a set of candidate labels and the classes are imbalanced, so I designed a **head classifier and a tail classifier that cooperate**. Each one handles the regime it is good at, so that ambiguity and imbalance do not amplify each other.

## Weak supervision, with foundation models
venue: RIKEN AIP · Dec 2025 – May 2026

As a student trainee in the Imperfect Information Learning Team, advised by Prof. Masashi Sugiyama, I started bringing these questions to pretrained foundation models, focusing on long-tailed distributions and noisy labels.

## Making long-context inference wait less
venue: Huawei 2012 Laboratories · Jun – Oct 2026
figure: kv-cache

A detour into systems. When a long-context request reuses a cached prefix, its KV-cache may be sitting on SSD. Native prefetching starts loading it only once the request is scheduled. I built **request-arrival-triggered prefetching** in vLLM + LMCache: the SSD→host transfer begins as soon as the request arrives, so I/O overlaps with the time it would have spent waiting in the queue anyway. (!) In a 3,379-request replay: **+31.57% request throughput** and **−24.49% mean time-to-first-token** compared with native prefetch. I also implemented asynchronous prefix prefetching in vLLM-Ascend + UCM (MLA and GQA paths). A related patent disclosure passed internal review.

## Toward trustworthy foundation models
venue: The University of Tokyo · Oct 2026 –
status: ongoing
note: no dedicated paper yet

The thread connecting all of the above: models should behave predictably when their supervision is imperfect, and they should be practical to deploy. My Ph.D. with Prof. Sugiyama aims to make weakly supervised and robust learning work for foundation models, with both principled guarantees and real systems.

# publications

## Complementary Label Learning with Positive Label Guessing and Negative Label Enhancement
authors: **Yuhang Li**, Zhuying Li, Yuheng Jia
venue: ICLR 2025
paper: https://proceedings.iclr.cc/paper_files/paper/2025/hash/95b6e2ff961580e03c0a662a63a71812-Abstract-Conference.html
code: https://github.com/yhli-ml/PLNL

## Boosting Class Representation via Semantically Related Instances for Robust Long-Tailed Learning with Noisy Labels
authors: **Yuhang Li**, Zhuying Li, Yuheng Jia
venue: ICCV 2025
paper: https://openaccess.thecvf.com/content/ICCV2025/html/Li_Boosting_Class_Representation_via_Semantically_Related_Instances_for_Robust_Long-Tailed_ICCV_2025_paper.html
code: https://github.com/yhli-ml/IBC

## Samples Are Not Equal: A Sample Selection Approach for Deep Clustering
authors: Zhengxing Jiao, Yaxin Hou, Jun Ma, **Yuhang Li**, Ding Ding, Yuheng Jia, Hui Liu, Junhui Hou
venue: ICLR 2026
paper: https://proceedings.iclr.cc/paper_files/paper/2026/file/63ef323523f3be8b58ed9277cc747485-Paper-Conference.pdf
code: https://github.com/notoaudrey/Samples-Are-Not-Equal

## Robust Long-Tailed Partial Label Learning by Head Classifier and Tail Classifier Cooperation
authors: Y. Jia, **Y. Li**, X. Peng, R. Wang, M. Zhang
venue: under review

# honors

- 2027 · JSPS DC1 Research Fellowship *(provisionally selected)*
- 2026 · BOOST NAIS, UTokyo / JST *(provisionally selected)*
- 2025 · National Scholarship for Graduates
- 2025 · SI-TECH “Future Star” Education Fund, Second Prize

# service

- reviewer · NeurIPS 2026, ICLR 2026
- reviewer · TMLR, Pattern Recognition, IJMLC
- reviewer · IEEE MLMC 2025 / 2026
