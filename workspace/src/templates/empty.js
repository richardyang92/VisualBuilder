// 完全空的Vue组合式API模板
export const emptyTemplate = `<template>
  <div class="custom-component">
    <!-- 在这里编写你的模板 -->
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 在这里编写你的逻辑
</script>

<style scoped>
/* 在这里编写你的样式 */
</style>`

// 带示例的Vue组合式API模板
export const exampleTemplate = `<template>
  <div class="custom-component">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    
    <!-- 响应式数据示例 -->
    <div class="counter-section">
      <h3>计数器示例</h3>
      <p>当前计数: {{ count }}</p>
      <button @click="increment">增加</button>
      <button @click="decrement">减少</button>
    </div>

    <!-- 计算属性示例 -->
    <div class="computed-section">
      <h3>计算属性示例</h3>
      <p>双倍计数: {{ doubleCount }}</p>
      <p>计数状态: {{ countStatus }}</p>
    </div>

    <!-- 事件处理示例 -->
    <div class="event-section">
      <h3>事件处理示例</h3>
      <input v-model="inputText" placeholder="输入一些文字..." />
      <button @click="handleSubmit">提交</button>
      <p v-if="submittedText">你输入了: {{ submittedText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 基础响应式数据
const title = ref('Vue 3 组合式API模板')
const description = ref('从零开始构建你的Vue组件')

// 计数器示例
const count = ref(0)
const increment = () => count.value++
const decrement = () => count.value--

// 计算属性
const doubleCount = computed(() => count.value * 2)
const countStatus = computed(() => 
  count.value === 0 ? '计数为0' : 
  count.value > 0 ? '正数' : '负数'
)

// 输入处理
const inputText = ref('')
const submittedText = ref('')

const handleSubmit = () => {
  submittedText.value = inputText.value
  inputText.value = ''
}

// 监听器示例
watch(count, (newVal, oldVal) => {
  console.log(\`计数从 \${oldVal} 变为 \${newVal}\`)
})
</script>

<style scoped>
.custom-component {
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin: 0 0 10px 0;
}

p {
  color: #666;
  margin: 0 0 20px 0;
}

.counter-section,
.computed-section,
.event-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

h3 {
  color: #007bff;
  margin: 0 0 10px 0;
  font-size: 16px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 0 5px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}
</style>`
