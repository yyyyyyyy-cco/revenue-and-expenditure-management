<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <!-- 头部：带渐变背景的标题 -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white">
        <h1 class="text-xl font-bold text-center flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.936 13.936 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          账户设置
        </h1>
      </div>

      <!-- 主内容区 -->
      <div class="p-6 space-y-6">
        <!-- 用户名设置 -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.936 13.936 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-base font-semibold text-gray-800">修改用户名</h2>
          </div>
          
          <div class="relative">
            <input
              v-model="username"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="输入新用户名 (3-20个字符)"
              :class="usernameError ? 'border-red-500' : ''"
            />
            <div v-if="usernameError" class="mt-1 text-xs text-red-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 0v2m0-2h2m0 0h-2m2 0h-2m-1 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {{ usernameError }}
            </div>
          </div>
          
          <button
            @click="updateUsername"
            :disabled="!isUsernameValid"
            class="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="isUsernameValid ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'bg-gray-200 text-gray-500'"
          >
            保存用户名
          </button>
        </div>

        <!-- 密码修改 -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-4.244 5.899L11 12a4 4 0 11-8 0 4 4 0 018 0zM11 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 class="text-base font-semibold text-gray-800">修改密码</h2>
          </div>
          
          <div class="space-y-3">
            <div class="relative">
              <input
                v-model="newPassword"
                type="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="输入新密码 (至少8个字符)"
              />
            </div>
            
            <div class="relative">
              <input
                v-model="confirmPassword"
                type="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="确认新密码"
              />
              <div v-if="passwordMismatch" class="mt-1 text-xs text-red-500 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 0v2m0-2h2m0 0h-2m2 0h-2m-1 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                密码不匹配
              </div>
            </div>
          </div>
          
          <button
            @click="updatePassword"
            :disabled="!isPasswordValid"
            class="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="isPasswordValid ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' : 'bg-gray-200 text-gray-500'"
          >
            修改密码
          </button>
        </div>

        <!-- 退出登录 -->
        <div class="pt-4 border-t border-gray-200">
          <button
            @click="logout"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H3" />
            </svg>
            退出登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const usernameError = ref('')
const passwordMismatch = ref(false)

onMounted(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if (!isLoggedIn) {
    router.push('/')
    return
  }
  username.value = localStorage.getItem('username') || ''
})

// 用户名验证
const isUsernameValid = computed(() => {
  const valid = username.value.trim().length >= 3 && username.value.trim().length <= 20
  usernameError.value = valid ? '' : '用户名需3-20个字符'
  return valid
})

// 密码验证
const isPasswordValid = computed(() => {
  const valid = newPassword.value.length >= 8
  passwordMismatch.value = valid && newPassword.value !== confirmPassword.value
  return valid && newPassword.value === confirmPassword.value
})

const updateUsername = () => {
  if (isUsernameValid.value) {
    localStorage.setItem('username', username.value)
    alert('用户名已更新成功！')
  }
}

const updatePassword = () => {
  if (isPasswordValid.value) {
    alert('密码已成功修改！')
    newPassword.value = ''
    confirmPassword.value = ''
  }
}

const logout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  router.push('/')
}
</script>

<style>
/* 确保所有元素在移动端都能正常显示 */
input {
  transition: all 0.3s ease;
}
</style>