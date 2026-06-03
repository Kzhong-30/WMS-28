import { PrismaClient } from '@prisma/client';
const UserRole = { USER: 'USER', ADMIN: 'ADMIN' } as const;
const ArticleStatus = { DRAFT: 'DRAFT', PENDING: 'PENDING', PUBLISHED: 'PUBLISHED', REJECTED: 'REJECTED' } as const;
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: '网站管理员，热爱技术分享',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      username: 'demo_user',
      email: 'user@example.com',
      password: hashedPassword,
      role: UserRole.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      bio: '全栈开发者，专注于 Web 技术',
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'frontend' },
      update: {},
      create: { name: '前端开发', slug: 'frontend', description: 'HTML, CSS, JavaScript, React, Vue 等前端技术' },
    }),
    prisma.category.upsert({
      where: { slug: 'backend' },
      update: {},
      create: { name: '后端开发', slug: 'backend', description: 'Node.js, Python, Java, Go 等后端技术' },
    }),
    prisma.category.upsert({
      where: { slug: 'database' },
      update: {},
      create: { name: '数据库', slug: 'database', description: 'MySQL, PostgreSQL, MongoDB, Redis 等数据库技术' },
    }),
    prisma.category.upsert({
      where: { slug: 'devops' },
      update: {},
      create: { name: 'DevOps', slug: 'devops', description: 'Docker, K8s, CI/CD 等运维技术' },
    }),
  ]);

  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'react' }, update: {}, create: { name: 'React', slug: 'react' } }),
    prisma.tag.upsert({ where: { slug: 'vue' }, update: {}, create: { name: 'Vue', slug: 'vue' } }),
    prisma.tag.upsert({ where: { slug: 'nextjs' }, update: {}, create: { name: 'Next.js', slug: 'nextjs' } }),
    prisma.tag.upsert({ where: { slug: 'nestjs' }, update: {}, create: { name: 'NestJS', slug: 'nestjs' } }),
    prisma.tag.upsert({ where: { slug: 'typescript' }, update: {}, create: { name: 'TypeScript', slug: 'typescript' } }),
    prisma.tag.upsert({ where: { slug: 'prisma' }, update: {}, create: { name: 'Prisma', slug: 'prisma' } }),
    prisma.tag.upsert({ where: { slug: 'tailwind' }, update: {}, create: { name: 'Tailwind CSS', slug: 'tailwind' } }),
  ]);

  const sampleArticles = [
    {
      title: 'Next.js 14 新特性详解：App Router 完全指南',
      slug: 'nextjs-14-app-router-guide',
      summary: '深入探索 Next.js 14 的 App Router 特性，包括服务端组件、流式渲染、数据缓存等核心概念。',
      content: `
<h2 id="intro">引言</h2>
<p>Next.js 14 带来了许多令人兴奋的新特性，其中 App Router 的稳定版本是最大的亮点。本文将带您深入了解这些新特性。</p>

<h2 id="server-components">服务端组件</h2>
<p>服务端组件是 Next.js 14 的核心创新。它们允许您在服务器上渲染组件，减少客户端 JavaScript 体积。</p>
<pre><code class="language-typescript">// app/page.tsx - 这是一个服务端组件
async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function Page() {
  const posts = await getPosts();
  return (
    <div>
      {posts.map((post) => (
        <h2 key={post.id}>{post.title}</h2>
      ))}
    </div>
  );
}
</code></pre>

<h2 id="streaming">流式渲染</h2>
<p>使用 Suspense 和流式渲染，您可以逐步向用户发送 UI，提高首屏加载速度。</p>

<h2 id="conclusion">总结</h2>
<p>Next.js 14 的这些新特性使得构建高性能、用户友好的 Web 应用变得更加容易。</p>
      `,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20web%20development%20with%20Next.js%2014%20dashboard%20interface&image_size=landscape_16_9',
      status: ArticleStatus.PUBLISHED,
      categoryId: categories[0].id,
      tagIds: [tags[0].id, tags[2].id, tags[4].id],
    },
    {
      title: 'TypeScript 高级类型编程技巧',
      slug: 'typescript-advanced-types-tips',
      summary: '掌握 TypeScript 的高级类型系统，包括条件类型、映射类型、模板字面量类型等高级特性。',
      content: `
<h2 id="intro">为什么需要高级类型</h2>
<p>TypeScript 的类型系统非常强大，掌握高级类型可以帮助我们编写出更安全、更具表达力的代码。</p>

<h2 id="conditional-types">条件类型</h2>
<p>条件类型允许我们根据类型条件选择不同的类型。</p>
<pre><code class="language-typescript">type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
</code></pre>

<h2 id="mapped-types">映射类型</h2>
<p>映射类型允许我们基于现有类型创建新类型。</p>
<pre><code class="language-typescript">type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};
</code></pre>

<h2 id="conclusion">总结</h2>
<p>掌握这些高级类型技巧，您的 TypeScript 代码将更加健壮和可维护。</p>
      `,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=TypeScript%20programming%20code%20editor%20with%20type%20annotations&image_size=landscape_16_9',
      status: ArticleStatus.PUBLISHED,
      categoryId: categories[0].id,
      tagIds: [tags[4].id],
    },
    {
      title: 'NestJS + Prisma 构建企业级 API',
      slug: 'nestjs-prisma-enterprise-api',
      summary: '从零开始构建一个生产级别的 REST API，包含认证、授权、数据验证、错误处理等完整功能。',
      content: `
<h2 id="intro">技术栈介绍</h2>
<p>NestJS 是一个用于构建高效、可扩展的 Node.js 服务端应用的框架。Prisma 是下一代 ORM，提供了类型安全的数据库访问。</p>

<h2 id="setup">项目初始化</h2>
<p>首先创建 NestJS 项目并安装 Prisma：</p>
<pre><code class="language-bash">npm i -g @nestjs/cli
nest new my-project
cd my-project
npm install prisma --save-dev
npx prisma init
</code></pre>

<h2 id="prisma-schema">定义 Prisma Schema</h2>
<pre><code class="language-prisma">model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User?   @relation(fields: [authorId], references: [id])
  authorId  Int?
}
</code></pre>

<h2 id="conclusion">总结</h2>
<p>NestJS 与 Prisma 的组合为构建企业级 API 提供了强大的基础。</p>
      `,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=server%20api%20architecture%20diagram%20with%20NestJS%20and%20database&image_size=landscape_16_9',
      status: ArticleStatus.PUBLISHED,
      categoryId: categories[1].id,
      tagIds: [tags[3].id, tags[4].id, tags[5].id],
    },
    {
      title: 'Tailwind CSS 实战：构建现代化响应式 UI',
      slug: 'tailwind-css-responsive-ui',
      summary: '学习如何使用 Tailwind CSS 快速构建美观、响应式的用户界面，包含常用组件的实现技巧。',
      content: `
<h2 id="intro">Tailwind CSS 简介</h2>
<p>Tailwind CSS 是一个实用优先的 CSS 框架，它提供了低级别的实用工具类，让您可以直接在 HTML 中构建设计。</p>

<h2 id="responsive">响应式设计</h2>
<p>Tailwind 提供了响应式前缀，让您可以轻松控制不同屏幕尺寸的样式：</p>
<pre><code class="language-html"><div class="w-full md:w-1/2 lg:w-1/3 p-4">
  响应式宽度
</div>
</code></pre>

<h2 id="components">常用组件</h2>
<p>以下是一个卡片组件的实现：</p>
<pre><code class="language-html"><div class="max-w-sm rounded overflow-hidden shadow-lg bg-white">
  <img class="w-full" src="..." alt="Sunset">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">卡片标题</div>
    <p class="text-gray-700 text-base">
      卡片内容描述...
    </p>
  </div>
</div>
</code></pre>

<h2 id="conclusion">总结</h2>
<p>Tailwind CSS 大大提高了 UI 开发效率，让开发者专注于业务逻辑而非 CSS 命名。</p>
      `,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20UI%20components%20design%20with%20Tailwind%20CSS%20colorful&image_size=landscape_16_9',
      status: ArticleStatus.PENDING,
      categoryId: categories[0].id,
      tagIds: [tags[6].id],
    },
    {
      title: 'Docker 容器化部署最佳实践',
      slug: 'docker-containerization-best-practices',
      summary: '深入理解 Docker 容器化技术，学习镜像优化、多阶段构建、安全配置等最佳实践。',
      content: `
<h2 id="intro">Docker 基础</h2>
<p>Docker 是一个开源的容器化平台，让开发者可以将应用及其依赖打包到一个可移植的容器中。</p>

<h2 id="multistage">多阶段构建</h2>
<p>使用多阶段构建可以显著减小镜像体积：</p>
<pre><code class="language-dockerfile"># 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
</code></pre>

<h2 id="security">安全最佳实践</h2>
<ul>
  <li>使用非 root 用户运行容器</li>
  <li>定期更新基础镜像</li>
  <li>仅暴露必要的端口</li>
  <li>使用 .dockerignore 排除不必要的文件</li>
</ul>

<h2 id="conclusion">总结</h2>
<p>遵循这些最佳实践，您的 Docker 容器将更加安全、高效。</p>
      `,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Docker%20container%20orchestration%20cloud%20servers%20blue&image_size=landscape_16_9',
      status: ArticleStatus.DRAFT,
      categoryId: categories[3].id,
      tagIds: [],
    },
  ];

  for (const article of sampleArticles) {
    const existing = await prisma.article.findUnique({ where: { slug: article.slug } });
    if (!existing) {
      const { tagIds, ...articleData } = article;
      await prisma.article.create({
        data: {
          ...articleData,
          authorId: user.id,
          publishedAt: article.status === ArticleStatus.PUBLISHED ? new Date() : null,
          tags: { connect: tagIds.map((id) => ({ id })) },
        },
      });
    }
  }

  console.log('Seed data created successfully!');
  console.log('Admin: admin@example.com / password123');
  console.log('User: user@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
