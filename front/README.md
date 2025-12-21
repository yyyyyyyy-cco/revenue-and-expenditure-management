# Frontend (Vue 3 + Vite)

这是本项目的前端部分，使用 Vue 3 + Vite 构建。下面包含简要说明和当前的项目结构树，方便开发与导航。

## 结构说明
- 技术栈：Vue 3、Vite、Element Plus、ECharts
- 核心功能：登录注册、账单管理（增删改查）、收支统计（图表显示）、**账单导入（支付宝/微信 CSV）**

## 项目结构（前端）

```
revenue-and-expenditure-management/
└─ front/
	├─ README.md
	├─ index.html
	├─ package.json
	├─ vite.config.js
	├─ public/
	└─ src/
		├─ App.vue
		├─ main.js
		├─ style.css
		├─ assets/
		└─ components/
			├─ AccountView.vue
			├─ LoginView.vue
			└─ Registerview.vue
```

## 快速开始
1. 安装依赖：

```bash
cd front
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```
