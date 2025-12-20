<template>
  <div class="app-container">
    <!-- 顶栏 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon size="24" color="#fff"><Wallet /></el-icon>
          <span class="logo-text">账单管理系统</span>
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
                    v-for="item in categories"
                    :key="item"
                    :label="item"
                    :value="item"
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
            :data="filteredBills"
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
            <el-table-column prop="category" label="分类" width="120"></el-table-column>
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
                    v-for="item in categories"
                    :key="item"
                    :label="item"
                    :value="item"
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

        <!-- 收支统计页面（占位） -->
        <div v-if="activePage === '3'" class="page-content empty-page">
          <el-empty description="统计功能正在开发中，敬请期待"></el-empty>
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
                  v-for="item in categories"
                  :key="item"
                  :label="item"
                  :value="item"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Menu, Plus, Wallet, User, Search, Refresh, Edit, Delete, 
  Check, DataAnalysis 
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// 侧边栏切换页面
const activePage = ref('1')
const handleMenuSelect = (index) => {
  activePage.value = index
  if (index === '2') {
    resetForm()
  }
}

// 账单分类列表
const categories = ref(['餐饮', '交通', '工资', '购物', '娱乐', '其他'])

// 模拟账单数据
const billList = ref([
  {
    id: 1,
    type: '收入',
    category: '工资',
    amount: 8000,
    date: '2025-12-01',
    remark: '12月工资'
  },
  {
    id: 2,
    type: '支出',
    category: '餐饮',
    amount: 200,
    date: '2025-12-05',
    remark: '午餐'
  },
  {
    id: 3,
    type: '支出',
    category: '交通',
    amount: 50,
    date: '2025-12-05',
    remark: '打车'
  }
])

// 筛选表单
const filterForm = reactive({
  month: '',
  type: '',
  category: ''
})

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 5
})

// 总账单数（用于分页）
const totalBills = computed(() => {
  let result = [...billList.value]
  if (filterForm.month) {
    result = result.filter(item => dayjs(item.date).format('YYYY-MM') === filterForm.month)
  }
  if (filterForm.type) {
    result = result.filter(item => item.type === filterForm.type)
  }
  if (filterForm.category) {
    result = result.filter(item => item.category === filterForm.category)
  }
  return result.length
})

// 筛选后的账单列表
const filteredBills = computed(() => {
  let result = [...billList.value]
  if (filterForm.month) {
    result = result.filter(item => dayjs(item.date).format('YYYY-MM') === filterForm.month)
  }
  if (filterForm.type) {
    result = result.filter(item => item.type === filterForm.type)
  }
  if (filterForm.category) {
    result = result.filter(item => item.category === filterForm.category)
  }
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

// 筛选事件
const handleFilter = () => {
  pagination.currentPage = 1
  ElMessage.success('筛选成功')
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.month = ''
  filterForm.type = ''
  filterForm.category = ''
  pagination.currentPage = 1
}

// 分页事件
const handleSizeChange = (val) => {
  pagination.pageSize = val
}
const handleCurrentChange = (val) => {
  pagination.currentPage = val
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
const handleSubmit = () => {
  billFormRef.value.validate((valid) => {
    if (valid) {
      const newId = Math.max(...billList.value.map(item => item.id), 0) + 1
      billList.value.push({
        id: newId,
        ...{ ...billForm }
      })
      ElMessage.success('账单添加成功')
      activePage.value = '1'
      resetForm()
    } else {
      ElMessage.error('请完善表单信息')
      return false
    }
  })
}

// 修改账单相关
const editDialogVisible = ref(false)
const handleEdit = (row) => {
  billForm.id = row.id
  billForm.type = row.type
  billForm.category = row.category
  billForm.amount = row.amount
  billForm.date = row.date
  billForm.remark = row.remark
  editDialogVisible.value = true
}

// 提交修改账单
const handleEditSubmit = () => {
  billFormRef.value.validate((valid) => {
    if (valid) {
      const index = billList.value.findIndex(item => item.id === billForm.id)
      if (index > -1) {
        billList.value[index] = { ...billForm }
        ElMessage.success('账单修改成功')
        editDialogVisible.value = false
      }
    } else {
      ElMessage.error('请完善表单信息')
      return false
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
  ).then(() => {
    const index = billList.value.findIndex(item => item.id === id)
    if (index > -1) {
      billList.value.splice(index, 1)
      ElMessage.success('账单删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
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