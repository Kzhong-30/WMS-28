import { PrismaClient, Prisma, User, Tag, Snippet } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function logInfo(msg: string) {
  const ts = new Date().toISOString()
  console.log(`[${ts}] [INFO] ${msg}`)
}

function logWarn(msg: string) {
  const ts = new Date().toISOString()
  console.warn(`[${ts}] [WARN] ${msg}`)
}

function logError(msg: string, err?: unknown) {
  const ts = new Date().toISOString()
  if (err) {
    console.error(`[${ts}] [ERROR] ${msg}:`, err)
  } else {
    console.error(`[${ts}] [ERROR] ${msg}`)
  }
}

async function safeCreateManyLikes(items: Array<{ userId: string; snippetId: string }>) {
  logInfo(`开始创建点赞关系: ${items.length} 条`)
  let created = 0
  for (let i = 0; i < items.length; i++) {
    const { userId, snippetId } = items[i]
    const existing = await prisma.like.findUnique({
      where: { userId_snippetId: { userId, snippetId } },
      select: { userId: true },
    })
    if (existing) {
      logWarn(`点赞关系已存在: userId=${userId} snippetId=${snippetId}，跳过`)
      continue
    }
    await prisma.like.create({ data: { userId, snippetId } })
    created++
  }
  logInfo(`点赞关系创建完成: 新增 ${created} / ${items.length} 条`)
}

async function safeCreateManyFavorites(items: Array<{ userId: string; snippetId: string }>) {
  logInfo(`开始创建收藏关系: ${items.length} 条`)
  let created = 0
  for (let i = 0; i < items.length; i++) {
    const { userId, snippetId } = items[i]
    const existing = await prisma.favorite.findUnique({
      where: { userId_snippetId: { userId, snippetId } },
      select: { userId: true },
    })
    if (existing) {
      logWarn(`收藏关系已存在: userId=${userId} snippetId=${snippetId}，跳过`)
      continue
    }
    await prisma.favorite.create({ data: { userId, snippetId } })
    created++
  }
  logInfo(`收藏关系创建完成: 新增 ${created} / ${items.length} 条`)
}

async function main() {
  logInfo('开始播种种子数据...')

  const passwordHash = await bcrypt.hash('123456', 10)
  logInfo('密码哈希生成完成')

  const userInputs = [
    {
      username: 'alice',
      email: 'alice@example.com',
      password: passwordHash,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      bio: '前端开发者，热爱 React 和 TypeScript',
    },
    {
      username: 'bob',
      email: 'bob@example.com',
      password: passwordHash,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      bio: '全栈工程师，Go 和 Node.js 专家',
    },
    {
      username: 'charlie',
      email: 'charlie@example.com',
      password: passwordHash,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
      bio: 'Python 后端，专注于数据科学和机器学习',
    },
  ]

  logInfo('开始创建/更新用户数据')
  const users: User[] = []
  for (const data of userInputs) {
    try {
      const user = await prisma.user.upsert({
        where: { username: data.username },
        create: data,
        update: { ...data, username: undefined },
      })
      logInfo(`用户 ${user.username} 准备完成 id=${user.id}`)
      users.push(user)
    } catch (err) {
      logError(`创建用户失败: ${data.username}`, err)
      throw err
    }
  }
  logInfo(`用户数据准备完成: ${users.length} 条`)

  const tagNames = [
    'react', 'typescript', 'nodejs', 'algorithm', 'util',
    'css', 'html', 'web', 'api', 'database',
  ]

  logInfo('开始创建/更新标签数据')
  const tags: Tag[] = []
  for (const name of tagNames) {
    try {
      const tag = await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
      logInfo(`标签 ${name} 准备完成 id=${tag.id}`)
      tags.push(tag)
    } catch (err) {
      logError(`创建标签失败: ${name}`, err)
      throw err
    }
  }
  logInfo(`标签数据准备完成: ${tags.length} 条`)

  const snippetsData = [
    {
      title: 'React useState Hook 基本用法',
      description: '展示 React 中 useState 钩子的常见使用模式，包括计数器、表单等场景',
      language: 'javascript',
      isPublic: true,
      authorIdx: 0,
      tagIdx: [0, 1],
      code: `import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  return (
    <div className="counter">
      <p>计数: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      <button onClick={() => setCount(c => c - 1)}>减少</button>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="输入名字"
      />
    </div>
  )
}

export default Counter`,
    },
    {
      title: 'TypeScript 泛型工具类型',
      description: 'Partial、Required、Pick、Omit 等常用工具类型的使用示例',
      language: 'typescript',
      isPublic: true,
      authorIdx: 0,
      tagIdx: [1, 4],
      code: `interface User {
  id: string
  name: string
  email: string
  age?: number
}

type PartialUser = Partial<User>
type RequiredUser = Required<User>
type UserPreview = Pick<User, 'id' | 'name'>
type UserWithoutId = Omit<User, 'id'>

function updateUser(id: string, data: Partial<User>): User {
  const user = db.find(id)
  return { ...user, ...data }
}

const userPreview: UserPreview = { id: '1', name: 'Alice' }`,
    },
    {
      title: 'CSS 实现毛玻璃效果卡片',
      description: '使用 backdrop-filter 和半透明背景实现现代 UI 中的玻璃拟态效果',
      language: 'css',
      isPublic: true,
      authorIdx: 0,
      tagIdx: [5, 6],
      code: `.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}`,
    },
    {
      title: 'HTML 响应式个人简介卡片',
      description: '一个完整的 HTML 页面，包含 CSS 和 JavaScript，实现交互式个人名片',
      language: 'html',
      isPublic: true,
      authorIdx: 1,
      tagIdx: [6, 5],
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>个人名片</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, sans-serif;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      width: 90%;
      max-width: 360px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .avatar {
      width: 100px; height: 100px; border-radius: 50%;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 36px; font-weight: bold;
    }
    .name { font-size: 24px; color: #333; margin-bottom: 8px; }
    .title { color: #888; margin-bottom: 20px; }
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; border: none;
      padding: 12px 32px; border-radius: 30px;
      font-size: 16px; cursor: pointer; transition: transform 0.2s;
    }
    .btn:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="card">
    <div class="avatar">A</div>
    <h1 class="name">Alice Wang</h1>
    <p class="title">全栈开发工程师</p>
    <button class="btn" onclick="sayHi()">联系我</button>
  </div>
  <script>
    function sayHi() {
      alert('你好！欢迎联系我 :)');
    }
  </script>
</body>
</html>`,
    },
    {
      title: 'Node.js Express REST API 模板',
      description: '完整的 Express.js API 服务器模板，包含路由、中间件和错误处理',
      language: 'javascript',
      isPublic: true,
      authorIdx: 1,
      tagIdx: [2, 8],
      code: `import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const logger = (req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`)
  next()
}

app.use(logger)

let items = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]

app.get('/api/items', (req, res) => {
  res.json({ success: true, data: items })
})

app.post('/api/items', (req, res) => {
  const newItem = { id: Date.now(), name: req.body.name }
  items.push(newItem)
  res.status(201).json({ success: true, data: newItem })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`)
})`,
    },
    {
      title: 'Go 并发 HTTP 请求处理',
      description: '使用 goroutine 和 channel 实现并发 API 请求，提升数据获取速度',
      language: 'go',
      isPublic: true,
      authorIdx: 1,
      tagIdx: [4, 8],
      code: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

type Post struct {
	ID    int    \`json:"id"\`
	Title string \`json:"title"\`
}

func fetchPost(id int, wg *sync.WaitGroup, results chan<- Post) {
	defer wg.Done()
	url := fmt.Sprintf("https://jsonplaceholder.typicode.com/posts/%d", id)
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("Error fetching post %d: %v\n", id, err)
		return
	}
	defer resp.Body.Close()
	var post Post
	if err := json.NewDecoder(resp.Body).Decode(&post); err != nil {
		fmt.Printf("Error decoding post %d: %v\n", id, err)
		return
	}
	results <- post
}

func main() {
	postIDs := []int{1, 2, 3, 4, 5}
	results := make(chan Post, len(postIDs))
	var wg sync.WaitGroup
	for _, id := range postIDs {
		wg.Add(1)
		go fetchPost(id, &wg, results)
	}
	go func() { wg.Wait(); close(results) }()
	count := 0
	for post := range results {
		fmt.Printf("Post %d: %s\n", post.ID, post.Title)
		count++
	}
	fmt.Printf("Total fetched: %d posts\n", count)
}`,
    },
    {
      title: 'Python 快速排序实现',
      description: '经典快速排序算法的 Python 实现，包含原地排序和分区逻辑',
      language: 'python',
      isPublic: true,
      authorIdx: 2,
      tagIdx: [3, 4],
      code: `def quicksort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pivot_index = partition(arr, low, high)
        quicksort(arr, low, pivot_index - 1)
        quicksort(arr, pivot_index + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

if __name__ == "__main__":
    test_cases = [
        [64, 34, 25, 12, 22, 11, 90],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [],
        [42],
    ]
    for idx, case in enumerate(test_cases, 1):
        result = quicksort(case.copy())
        print(f"测试用例 {idx}: {case} -> {result}")`,
    },
    {
      title: 'SQL 常用查询语句集锦',
      description: '日常开发中常用的 SQL 查询模式，包括 JOIN、子查询、窗口函数等',
      language: 'sql',
      isPublic: true,
      authorIdx: 2,
      tagIdx: [9, 4],
      code: `SELECT id, name, email
FROM users
WHERE created_at >= '2024-01-01'
ORDER BY created_at DESC
LIMIT 10;

SELECT o.id AS order_id, u.name AS user_name,
       o.total_amount, o.status
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'paid';

SELECT DATE(created_at) AS date,
       COUNT(*) AS total_orders,
       SUM(total_amount) AS revenue,
       AVG(total_amount) AS avg_order_value
FROM orders
GROUP BY DATE(created_at)
HAVING COUNT(*) > 5
ORDER BY date DESC;

SELECT name, department, salary,
       RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;`,
    },
    {
      title: 'JavaScript 防抖节流实现',
      description: '手写 debounce 和 throttle 工具函数，附带立即执行和取消防抖功能',
      language: 'javascript',
      isPublic: true,
      authorIdx: 0,
      tagIdx: [4, 1],
      code: `function debounce(fn, delay = 300, immediate = false) {
  let timer = null
  const debounced = function (...args) {
    const ctx = this
    if (timer) clearTimeout(timer)
    if (immediate) {
      const callNow = !timer
      timer = setTimeout(() => { timer = null }, delay)
      if (callNow) return fn.apply(ctx, args)
    } else {
      timer = setTimeout(() => {
        fn.apply(ctx, args)
        timer = null
      }, delay)
    }
  }
  debounced.cancel = () => { if (timer) { clearTimeout(timer); timer = null } }
  return debounced
}

function throttle(fn, delay = 300) {
  let lastTime = 0
  let timer = null
  return function (...args) {
    const ctx = this
    const now = Date.now()
    const remain = delay - (now - lastTime)
    if (remain <= 0) {
      if (timer) { clearTimeout(timer); timer = null }
      lastTime = now
      fn.apply(ctx, args)
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now()
        timer = null
        fn.apply(ctx, args)
      }, remain)
    }
  }
}`,
    },
    {
      title: 'Python 数据清洗 Pandas 技巧',
      description: '常用的 Pandas 数据清洗操作，包括缺失值处理、去重、类型转换等',
      language: 'python',
      isPublic: true,
      authorIdx: 2,
      tagIdx: [4, 9],
      code: `import pandas as pd
import numpy as np

df = pd.read_csv('data.csv')
print("基本信息:")
print(df.info())
print(df.isnull().sum())

df['age'] = df['age'].fillna(df['age'].median())
df['email'] = df['email'].fillna('unknown@example.com')
df_clean = df.dropna(subset=['name'])

print(f"去重前行数: {len(df_clean)}")
df_clean = df_clean.drop_duplicates(subset=['email'])
print(f"去重后行数: {len(df_clean)}")

df_clean['date'] = pd.to_datetime(df_clean['date'])
df_clean['age'] = df_clean['age'].astype(int)
df_clean['name'] = df_clean['name'].str.strip().str.title()
df_clean = df_clean[df_clean['age'].between(18, 120)]

df_clean.to_csv('cleaned_data.csv', index=False)
print("处理完成！已保存到 cleaned_data.csv")`,
    },
    {
      title: 'Markdown 文档写作模板',
      description: '常用 Markdown 语法速查和项目文档模板',
      language: 'markdown',
      isPublic: true,
      authorIdx: 1,
      tagIdx: [6, 4],
      code: `# 项目名称

> 项目一句话简介，说明项目解决的问题和核心价值。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://semver.org)

## 功能特性

- **特性1**: 描述
- **特性2**: 描述
- **特性3**: 描述

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | React, TypeScript, Tailwind CSS |
| 后端 | Node.js, Express, PostgreSQL |

## 快速开始

\`\`\`bash
git clone https://github.com/user/project.git
cd project && npm install && npm run dev
\`\`\`

## 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License`,
    },
    {
      title: 'Rust 所有权系统示例',
      description: '通过示例理解 Rust 的所有权、借用和生命周期概念',
      language: 'rust',
      isPublic: true,
      authorIdx: 2,
      tagIdx: [4],
      code: `fn main() {
    let s1 = String::from("hello");
    let s2 = s1;
    println!("{}", s2);

    let s3 = String::from("world");
    let len = calculate_length(&s3);
    println!("'{}' 的长度是 {}", s3, len);

    let mut s4 = String::from("foo");
    change(&mut s4);
    println!("修改后: {}", s4);

    let result = longest("hello", "world");
    println!("最长的是: {}", result);
}

fn calculate_length(s: &String) -> usize { s.len() }
fn change(s: &mut String) { s.push_str(", bar"); }

fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}`,
    },
  ]

  logInfo('开始创建代码片段数据')
  const createdSnippets: Snippet[] = []
  for (let i = 0; i < snippetsData.length; i++) {
    const data = snippetsData[i]
    try {
      const tagConnections = data.tagIdx
        .filter((ti) => ti >= 0 && ti < tags.length)
        .map((ti) => ({ tagId: tags[ti].id }))

      const snippet = await prisma.snippet.create({
        data: {
          title: data.title,
          description: data.description,
          code: data.code,
          language: data.language,
          isPublic: data.isPublic,
          authorId: users[data.authorIdx].id,
          tags: { create: tagConnections.map(({ tagId }) => ({ tagId })) },
        },
        include: { tags: true },
      })
      logInfo(
        `片段创建完成 [${i + 1}/${snippetsData.length}]: id=${snippet.id} title=${snippet.title} lang=${snippet.language}`
      )
      createdSnippets.push(snippet)
    } catch (err) {
      logError(`创建片段失败 [${i + 1}/${snippetsData.length}]: title=${data.title}`, err)
      throw err
    }
  }
  logInfo(`代码片段创建完成: ${createdSnippets.length} 条`)

  const likePairs = [
    [0, 1], [0, 2], [0, 4],
    [1, 0], [1, 6], [1, 8],
    [2, 0], [2, 3], [2, 8],
  ]
  const likeItems = likePairs
    .filter(([ui, si]) => users[ui] && createdSnippets[si])
    .map(([ui, si]) => ({
      userId: users[ui].id,
      snippetId: createdSnippets[si].id,
    }))
  await safeCreateManyLikes(likeItems)

  const favPairs = [
    [0, 3], [0, 8],
    [1, 1], [1, 7],
    [2, 4], [2, 2],
  ]
  const favItems = favPairs
    .filter(([ui, si]) => users[ui] && createdSnippets[si])
    .map(([ui, si]) => ({
      userId: users[ui].id,
      snippetId: createdSnippets[si].id,
    }))
  await safeCreateManyFavorites(favItems)

  const commentsData = [
    { content: '这个 Hook 封装得真不错，收藏了！', s: 0, u: 1 },
    { content: '泛型工具类型真是 TypeScript 的利器，每天都在用', s: 1, u: 2 },
    { content: '毛玻璃效果加上动画简直绝了，我项目里刚好需要', s: 2, u: 1 },
    { content: 'Rust 所有权是真的难理解，但这个例子讲得很清楚', s: 11, u: 0 },
    { content: '防抖节流面试必考题，必须手写出来', s: 8, u: 2 },
  ]
  logInfo(`开始创建评论: ${commentsData.length} 条`)
  for (let i = 0; i < commentsData.length; i++) {
    const c = commentsData[i]
    try {
      if (!users[c.u] || !createdSnippets[c.s]) {
        logWarn(`评论数据引用不存在: u=${c.u} s=${c.s}，跳过`)
        continue
      }
      const comment = await prisma.comment.create({
        data: {
          content: c.content,
          snippetId: createdSnippets[c.s].id,
          authorId: users[c.u].id,
        },
      })
      logInfo(`评论创建完成 [${i + 1}/${commentsData.length}]: id=${comment.id}`)
    } catch (err) {
      logError(`创建评论失败 [${i + 1}/${commentsData.length}]`, err)
      throw err
    }
  }
  logInfo('评论创建完成')

  logInfo('='.repeat(60))
  logInfo('播种全部完成！演示账号信息（密码均为 123456）：')
  users.forEach((u) => {
    logInfo(`  用户名=${u.username}  邮箱=${u.email}`)
  })
  logInfo(`共创建/更新 用户=${users.length} 标签=${tags.length} 片段=${createdSnippets.length}`)
  logInfo('='.repeat(60))
}

main()
  .catch((err) => {
    logError('播种过程发生致命错误，终止执行', err)
    process.exit(1)
  })
  .finally(async () => {
    logInfo('关闭 Prisma 数据库连接')
    await prisma.$disconnect()
    logInfo('程序退出')
  })
