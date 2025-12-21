# Frontend (Vue 3 + Vite)

这是本项目的前端部分，使用 Vue 3 + Vite 构建。

## 结构说明
- 技术栈：Vue 3、Vite、Element Plus、Echarts、Dayjs
- 核心功能：
  - **账单管理**：增删改查、多维筛选、分页。
  - **收支统计分析**：分类占比饼图、最近6个月收支趋势图。
  - **账单自动导入**：支持支付宝、微信 CSV 文件拖拽上传与自动分类。
  - **周期性任务管理**：自定义工资收入、会员扣费等固定周期项目，自动补全账单。

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
