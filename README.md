# 🥗 NomAi / SnapNut
> **AI 驱动的极简营养追踪助手，让健康饮食回归直觉。**

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)


---

## 🌟 项目简介

**NomAi** 是一款专为 25-38 岁城市白领、健身爱好者及减脂人群设计的移动端优先（Mobile-First）营养追踪 Web App。它抛弃了传统工具繁琐的输入流程，通过 AI 视觉识别与智能方案推荐，帮助你轻松掌控每日卡路里与宏量营养素。

- 📸 **视觉记录**：AI 拍照识别食物，自动解析热量与成分。
- ⚡ **无感登录**：Magic Link 密码登录，极速开启健康之旅。
- 🎨 **极简交互**：基于 Framer Motion 的丝滑动画与 Emerald 翠绿色系设计。
- 🌓 **深度适配**：原生级的深色模式支持，夜晚记录也不刺眼。

---

## 📸 预览展示

| 📊 仪表盘 | ⚙️ 完善资料 | 🥘 智能餐单 |
| :---: | :---: | :---: |
| ![Dashboard](https://via.placeholder.com/300x600/10b981/ffffff?text=Dashboard) | ![Settings](https://via.placeholder.com/300x600/10b981/ffffff?text=Onboarding) | ![MealPlan](https://via.placeholder.com/300x600/10b981/ffffff?text=Meal+Plan) |

---

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/NomAI.git
cd NomAI
```

### 2. 安装依赖
```bash
pnpm install
```

### 3. 配置环境变量
在项目根目录创建 `.env.local` 文件，并填入你的 Supabase 凭据：
```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名Key
```

### 4. 启动开发服务器
```bash
pnpm dev
```

---

## ✨ 功能亮点

### 🤖 AI 智能引擎
- **拍照识物**：通过相机或相册上传食物图片，自动识别品类与分量。
- **营养解析**：即时获取蛋白质、脂肪、碳水化合物及总热量数据。

### 🛡️ 稳健的认证与流程
- **Magic Link**：通过邮箱验证码实现无密码安全登录。
- **强制 Onboarding**：新用户登录后自动引导完善身体数据，确保方案个性化。
- **安全登出**：带确认弹窗的完全退出流程，自动清理本地缓存隐私。

### 📱 极致交互体验
- **WeightInput**：针对移动端优化的体重输入组件，支持自动去前导零与实时范围校验。
- **智能通知**：基于 `react-hot-toast` 的非阻塞式反馈系统，支持 Promise 状态联动。
- **全站动画**：菜单滑入、模态框弹出均采用 Framer Motion，手感丝滑。

---

## 🛠️ 技术栈

- **Frontend**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend/BaaS**: [Supabase](https://supabase.com/) (Auth, Database, RLS)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)

---

## 📂 项目结构概览

```text
src/
├── components/     # 通用 UI 组件 (UserMenu, WeightInput, Toaster 等)
├── contexts/       # 状态管理 (AuthContext, 路由保护逻辑)
├── lib/            # 第三方库配置 (Supabase Client)
├── pages/          # 页面级组件 (Dashboard, Auth, Settings 等)
├── utils/          # 工具函数 (Toast 封装, 格式化工具)
└── App.tsx         # 路由配置与全局 Provider
```

---

## 📝 环境变量说明

为了确保项目正常运行，请确保 `.env.local` 包含以下字段：

| 变量名 | 说明 | 示例 |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase 项目的 API 地址 | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase 项目的匿名访问密钥 | `eyJhbGci...` |

---

## 📅 未来计划 (Roadmap)

- [ ] 🧪 **多账号管理**：支持快速切换不同家庭成员账号。
- [ ] 🎬 **Lottie 动画集成**：在关键成功路径（如目标达成）加入炫酷动画。
- [ ] 📊 **进度条 Toast**：为 AI 生成餐单等长耗时操作加入进度感知。
- [ ] 🍱 **本地数据库支持**：集成 IndexedDB (Dexie) 实现更强大的离线记录功能。
- [ ] 🔗 **健康数据同步**：对接 Apple Health / Google Fit。


## 👨‍💻 作者

**NomAi Team**
- GitHub: [@Jack-sh1](https://github.com/Jack-sh1)
- Email: [shennalin2@gmail.com](mailto:shennalin2@gmail.com)

---

如果这个项目对你有帮助，欢迎点一个 **⭐ Star**！
