<template>
  <div class="app-container">
    <!-- 顶栏 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon size="24" color="#fff"><Wallet /></el-icon>
          <span class="logo-text">个人收支管理系统</span>
        </div>
        <div class="user-info">
          <el-icon size="18" color="#fff"><User /></el-icon>
          <span class="username">普通用户</span>
        </div>
      </div>
    </el-header>

    <div class="main-content">
      <!-- 侧边栏 -->
      <el-aside class="sidebar">
        <el-menu
          default-active="1"
          class="sidebar-menu"
          @select="handleMenuSelect"
          background-color="#2c3e50"
          text-color="#fff"
          active-text-color="#409eff"
        >
          <el-menu-item index="1">
            <el-icon><Menu /></el-icon>
            <span slot="title">账单列表</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><Plus /></el-icon>
            <span slot="title">添加账单</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><DataAnalysis /></el-icon>
            <span slot="title">收支统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h2 class="page-title">{{ activePage === '1' ? '账单列表' : activePage === '2' ? '添加账单' : '收支统计' }}</h2>
          <el-divider direction="vertical"></el-divider>
          <span class="page-desc">{{ activePage === '1' ? '查看、筛选、管理所有账单' : activePage === '2' ? '录入新的收支账单' : '暂无统计数据，敬请期待' }}</span>
        </div>

        <!-- 账单列表页面 -->
        <div v-if="activePage === '1'" class="page-content">
          <!-- 筛选卡片 -->
          <el-card class="filter-card">
            <el-form :inline="true" :model="filterForm" class="filter-form">
              <el-form-item label="月份">
                <el-date-picker
                  v-model="filterForm.month"
                  type="month"
                  placeholder="选择月份"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  class="filter-input"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="收支类型">
                <el-select v-model="filterForm.type" placeholder="全部" class="filter-input">
                  <el-option label="收入" value="收入"></el-option>
                  <el-option label="支出" value="支出"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="分类">
                <el-select v-model="filterForm.category" placeholder="全部" class="filter-input">
                  <el-option
                    v-for="item in filterCategories"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleFilter" class="filter-btn">
                  <el-icon><Search /></el-icon> 筛选
                </el-button>
                <el-button @click="resetFilter" class="reset-btn">
                  <el-icon><Refresh /></el-icon> 重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 账单表格 -->
          <el-table
            :data="billList"
            border
            stripe
            hover
            style="width: 100%; margin-top: 20px"
            class="bill-table"
            empty-text="暂无账单数据，请添加新账单"
          >
            <el-table-column prop="type" label="收支类型">
              <template #default="scope">
                <el-tag :type="scope.row.type === '收入' ? 'success' : 'danger'">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="category_name" label="分类" width="120"></el-table-column>
            <el-table-column prop="amount" label="金额(元)" width="120">
              <template #default="scope">
                <span :class="scope.row.type === '收入' ? 'income-amount' : 'expense-amount'">
                  {{ scope.row.type === '收入' ? '+' : '-' }}{{ scope.row.amount.toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="日期" width="120"></el-table-column>
            <el-table-column prop="remark" label="备注" min-width="200"></el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleEdit(scope.row)"
                  class="edit-btn"
                >
                  <el-icon><Edit /></el-icon> 修改
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDelete(scope.row.id)"
                  class="delete-btn"
                >
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[5, 10, 20]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalBills"
            style="margin-top: 20px; text-align: right"
            class="pagination"
          >
          </el-pagination>
        </div>

        <!-- 添加/修改账单页面 -->
        <div v-if="activePage === '2'" class="page-content">
          <el-card class="form-card">
            <el-form
              :model="billForm"
              :rules="billRules"
              ref="billFormRef"
              label-width="100px"
              class="bill-form"
            >
              <el-form-item label="收支类型" prop="type">
                <el-radio-group v-model="billForm.type" class="radio-group">
                  <el-radio label="收入" border class="radio-item">收入</el-radio>
                  <el-radio label="支出" border class="radio-item">支出</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="分类" prop="category">
                <el-select v-model="billForm.category" placeholder="请选择分类" class="form-select">
                  <el-option
                    v-for="item in formCategories"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="金额(元)" prop="amount">
                <el-input
                  v-model.number="billForm.amount"
                  type="number"
                  placeholder="请输入金额（保留2位小数）"
                  class="form-input"
                  step="0.01"
                  precision="2"
                ></el-input>
              </el-form-item>
              <el-form-item label="日期" prop="date">
                <el-date-picker
                  v-model="billForm.date"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  class="form-input"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="billForm.remark"
                  type="textarea"
                  placeholder="请输入备注（选填）"
                  class="form-textarea"
                  :rows="3"
                ></el-input>
              </el-form-item>
              <el-form-item class="form-btn-group">
                <el-button type="primary" @click="handleSubmit" class="submit-btn">
                  <el-icon><Check /></el-icon> 提交
                </el-button>
                <el-button @click="resetForm" class="reset-form-btn">
                  <el-icon><Refresh /></el-icon> 重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- 收支统计页面 -->
        <div v-if="activePage === '3'" class="page-content stats-page">
          <el-card class="filter-card" style="margin-bottom: 16px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <el-date-picker v-model="statsMonth" type="month" placeholder="选择月份" format="YYYY-MM" value-format="YYYY-MM" />
              <el-button type="primary" @click="fetchCategoryRatio">刷新</el-button>
              <div style="margin-left: auto; color: #909399">总计：{{ statsTotal | numberFormat }}</div>
            </div>
          </el-card>

          <el-card class="filter-card">
            <div ref="chartRef" class="pie-chart" style="height:420px; width:100%;"></div>
          </el-card>
        </div>

        <!-- 修改账单弹窗 -->
        <el-dialog
          v-model="editDialogVisible"
          title="修改账单"
          width="600px"
          class="edit-dialog"
          :close-on-click-modal="false"
        >
          <el-form
            :model="billForm"
            :rules="billRules"
            ref="billFormRef"
            label-width="100px"
            class="edit-form"
          >
            <el-form-item label="收支类型" prop="type">
              <el-radio-group v-model="billForm.type" class="radio-group">
                <el-radio label="收入" border class="radio-item">收入</el-radio>
                <el-radio label="支出" border class="radio-item">支出</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="分类" prop="category">
              <el-select v-model="billForm.category" placeholder="请选择分类" class="form-select">
                <el-option
                  v-for="item in formCategories"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="金额(元)" prop="amount">
              <el-input
                v-model.number="billForm.amount"
                type="number"
                placeholder="请输入金额"
                class="form-input"
                step="0.01"
                precision="2"
              ></el-input>
            </el-form-item>
            <el-form-item label="日期" prop="date">
              <el-date-picker
                v-model="billForm.date"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="form-input"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="billForm.remark"
                type="textarea"
                placeholder="请输入备注（选填）"
                class="form-textarea"
                :rows="3"
              ></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="editDialogVisible = false" class="cancel-btn">取消</el-button>
            <el-button type="primary" @click="handleEditSubmit" class="confirm-btn">
              <el-icon><Check /></el-icon> 确认修改
            </el-button>
          </template>
        </el-dialog>
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Menu, Plus, Wallet, User, Search, Refresh, Edit, Delete, 
  Check, DataAnalysis 
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

// 侧边栏切换页面
const activePage = ref('1')
const handleMenuSelect = (index) => {
  activePage.value = index
  if (index === '2') {
    resetForm()
  }
}

// 账单分类（从后端获取）
const categories = ref([])

// 账单数据（从后端获取）
const billList = ref([])
const totalBills = ref(0)

onMounted(() => {
  document.body.classList.add('full-width-app')
  fetchCategories()
  fetchBills()
})

onUnmounted(() => {
  document.body.classList.remove('full-width-app')
})

// 筛选表单（category 存储 category_id）
const filterForm = reactive({
  month: '',
  type: '',
  category: ''
})

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const API_BASE = 'http://localhost:3000'
const token = localStorage.getItem('token') || ''

// 统计相关
const statsMonth = ref(new Date().toISOString().slice(0,7))
const statsData = ref([])
const statsTotal = ref(0)
const chartRef = ref(null)
let chartInstance = null

const fetchCategoryRatio = async () => {
  try {
    const params = new URLSearchParams()
    if (statsMonth.value) params.append('month', statsMonth.value)
    const res = await fetch(`${API_BASE}/api/stat/category-ratio?${params.toString()}`, {
      headers: token ? { Authorization: 'Bearer ' + token } : {}
    })
    const data = await res.json()
    if (!res.ok) {
      ElMessage.error(data.error || '获取分类占比失败')
      return
    }
    statsData.value = data.map(r => ({ name: r.category_name, value: Number(r.value) }))
    statsTotal.value = statsData.value.reduce((s, i) => s + (i.value || 0), 0)
    await nextTick()
    renderChart()
  } catch (err) {
    console.error('fetchCategoryRatio error', err)
    ElMessage.error('无法连接到服务器')
  }
}

const renderChart = () => {
  if (!chartRef.value) return
  if (!chartInstance) chartInstance = echarts.init(chartRef.value)
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
        labelLine: { show: false },
        data: statsData.value
      }
    ]
  }
  chartInstance.setOption(option)
}

watch(statsMonth, () => fetchCategoryRatio())

// 获取分类
const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/categories`)
    const data = await res.json()
    if (!res.ok) {
      ElMessage.error('获取分类失败')
      return
    }
    // 去重（以 type+name 为准），并按 type/name 排序
    const map = new Map()
    data.forEach(c => {
      if (c && c.name) {
        const key = `${c.type}|${c.name}`
        if (!map.has(key)) map.set(key, c)
      }
    })
    categories.value = Array.from(map.values()).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type.localeCompare(b.type)
    })
  } catch (err) {
    console.error('fetchCategories error', err)
    ElMessage.error('无法获取分类')
  }
}

// 获取账单列表
const fetchBills = async () => {
  try {
    const params = new URLSearchParams()
    params.append('page', pagination.currentPage)
    params.append('limit', pagination.pageSize)
    if (filterForm.month) params.append('month', filterForm.month)
    if (filterForm.type) params.append('type', filterForm.type === '收入' ? 'income' : 'expense')
    if (filterForm.category) params.append('category_id', filterForm.category)

    const res = await fetch(`${API_BASE}/api/bills?${params.toString()}`, {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    })
    const data = await res.json()
    if (!res.ok) {
      ElMessage.error(data.error || '获取账单失败')
      return
    }
    // 后端返回 data.data 和 pagination
    billList.value = data.data.map(item => ({ ...item, type: item.type === 'income' ? '收入' : '支出' }))
    totalBills.value = data.pagination?.total || 0
  } catch (err) {
    console.error('fetchBills error', err)
    ElMessage.error('无法连接到服务器')
  }
}

// 筛选事件
const handleFilter = () => {
  pagination.currentPage = 1
  fetchBills()
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.month = ''
  filterForm.type = ''
  filterForm.category = ''
  pagination.currentPage = 1
  fetchBills()
}

// 分页事件
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchBills()
}
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchBills()
}

// 账单表单
const billFormRef = ref(null)
const billForm = reactive({
  id: '',
  type: '',
  category: '',
  amount: '',
  date: '',
  remark: ''
})

// 根据筛选类型动态过滤分类（筛选下拉使用）
const filterCategories = computed(() => {
  if (!filterForm.type) return categories.value
  const t = filterForm.type === '收入' ? 'income' : 'expense'
  return categories.value.filter(c => c.type === t)
})

// 根据表单选择的类型动态过滤分类（添加/编辑表单使用）
const formCategories = computed(() => {
  if (!billForm.type) return categories.value
  const t = billForm.type === '收入' ? 'income' : 'expense'
  return categories.value.filter(c => c.type === t)
})

// 表单校验规则
const billRules = {
  type: [{ required: true, message: '请选择收支类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

// 重置表单
const resetForm = () => {
  billFormRef.value?.resetFields()
  billForm.id = ''
  billForm.type = ''
  billForm.category = ''
  billForm.amount = ''
  billForm.date = ''
  billForm.remark = ''
}

// 提交添加账单
const handleSubmit = async () => {
  billFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请完善表单信息')
      return false
    }
    try {
      const body = {
        type: billForm.type === '收入' ? 'income' : 'expense',
        amount: Number(billForm.amount),
        category_id: billForm.category || null,
        date: billForm.date,
        remark: billForm.remark
      }
      const res = await fetch(`${API_BASE}/api/bills`, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) {
        ElMessage.error(data.error || '添加失败')
        return
      }
      ElMessage.success('账单添加成功')
      activePage.value = '1'
      resetForm()
      fetchBills()
    } catch (err) {
      console.error('handleSubmit error', err)
      ElMessage.error('无法连接到服务器')
    }
  })
}

// 修改账单相关
const editDialogVisible = ref(false)
const handleEdit = (row) => {
  billForm.id = row.id
  billForm.type = row.type === '收入' ? '收入' : '支出'
  billForm.category = row.category_id || ''
  billForm.amount = row.amount
  billForm.date = row.date
  billForm.remark = row.remark
  editDialogVisible.value = true
}

// 提交修改账单
const handleEditSubmit = async () => {
  billFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请完善表单信息')
      return false
    }
    try {
      const body = {
        type: billForm.type === '收入' ? 'income' : 'expense',
        amount: Number(billForm.amount),
        category_id: billForm.category || null,
        date: billForm.date,
        remark: billForm.remark
      }
      const res = await fetch(`${API_BASE}/api/bills/${billForm.id}`, {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) {
        ElMessage.error(data.error || '更新失败')
        return
      }
      ElMessage.success('账单修改成功')
      editDialogVisible.value = false
      fetchBills()
    } catch (err) {
      console.error('handleEditSubmit error', err)
      ElMessage.error('无法连接到服务器')
    }
  })
}

// 删除账单
const handleDelete = (id) => {
  ElMessageBox.confirm(
    '确定要删除该账单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bills/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      })
      const data = await res.json()
      if (!res.ok) {
        ElMessage.error(data.error || '删除失败')
        return
      }
      ElMessage.success('账单删除成功')
      fetchBills()
    } catch (err) {
      console.error('handleDelete error', err)
      ElMessage.error('无法连接到服务器')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  })
</script>

<style scoped>
/* 全局布局 - 确保全屏 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  width: 100%;
  box-sizing: border-box;
}

/* 在 full-width 模式下取消内部所有卡片的圆角 */
:deep(body.full-width-app) .filter-card,
:deep(body.full-width-app) .bill-table,
:deep(body.full-width-app) .form-card {
  border-radius: 0 !important;
}

/* 在 full-width 模式下使添加/编辑表单卡片横向铺满 */
:deep(body.full-width-app) .form-card {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

:deep(body.full-width-app) .page-content {
  width: 100% !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
}

/* 顶栏样式 */
.header {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
  padding: 0 20px;
  height: 64px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* 主内容布局 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 200px !important;
  background-color: #2c3e50;
  box-shadow: 2px 0 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.el-menu-item {
  transition: all 0.2s ease;
}

.el-menu-item:hover {
  background-color: #1abc9c !important;
}

/* 主内容区样式 */
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
  scrollbar-gutter: stable;
}

/* 页面标题 */
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.page-desc {
  font-size: 14px;
  color: #909399;
}

/* 页面内容容器 */
.page-content {
  width: 100%;
}

.pie-chart {
  width: 100%;
  height: 420px;
}

/* 筛选卡片样式 */
.filter-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 15px;
  transition: all 0.3s ease;
}

.filter-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

.filter-form {
  width: 100%;
}

.filter-input {
  width: 180px;
}

.filter-btn, .reset-btn {
  padding: 8px 20px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background-color: #337ecc;
}

/* 账单表格样式 */
.bill-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.income-amount {
  color: #67c23a;
  font-weight: 600;
}

.expense-amount {
  color: #f56c6c;
  font-weight: 600;
}

.edit-btn, .delete-btn {
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: #337ecc;
}

.delete-btn:hover {
  background-color: #e4393c;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
}

/* 表单卡片样式 */
.form-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* 确保添加/编辑页面的卡片在页面内容容器中横向铺满 */
.page-content .form-card {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
  border-radius: 0 !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
}

.bill-form {
  width: 100%;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-item {
  padding: 8px 20px;
}

.form-select, .form-input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
}

.form-textarea {
  width: 100%;
  border-radius: 4px;
}

.form-btn-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.submit-btn, .reset-form-btn {
  padding: 10px 30px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background-color: #337ecc;
}

/* 空页面样式 */
.empty-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

/* 弹窗样式 */
.edit-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.edit-form {
  width: 100%;
}

.cancel-btn, .confirm-btn {
  padding: 8px 20px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  background-color: #337ecc;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .sidebar {
    width: 60px !important;
  }

  .el-menu-item span {
    display: none;
  }

  .filter-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .filter-input {
    width: 100%;
  }
}
</style>