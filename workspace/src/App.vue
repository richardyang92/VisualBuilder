<template>
  <div class="app-container">
    <Toolbar ref="toolbarRef" @template-selected="applyTemplate" />
    <div class="main-content">
      <div class="left-panel">
        <Editor v-model="code" @code-change="handleCodeChange" />
      </div>
      <div class="center-panel">
        <Preview :code="code" :props="componentProps" @error="handlePreviewError" />
      </div>
      <div class="right-panel">
        <PropertyPanel 
          :props-schema="propsSchema" 
          :props-values="componentProps"
          @props-change="handlePropsChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Toolbar from './components/Toolbar.vue'
import Editor from './components/Editor.vue'
import Preview from './components/Preview.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import { parseVueComponent, generateVueComponent } from './utils/vueParser'
import { defaultCode } from './templates/default.js'

const code = ref(defaultCode)
const toolbarRef = ref(null)

const componentProps = ref({})
const propsSchema = ref([])

// 解析Vue组件的props
const handleCodeChange = (newCode) => {
  try {
    const parsed = parseVueComponent(newCode)
    console.log('Parsed component props:', parsed.props)
    propsSchema.value = parsed.props || []
    // 初始化props值
    const initialProps = {}
    propsSchema.value.forEach(prop => {
      initialProps[prop.name] = prop.default || ''
    })
    console.log('Initial props values:', initialProps)
    componentProps.value = initialProps
  } catch (error) {
    console.error('代码解析错误:', error)
  }
}

// 处理属性变化 - 仅更新属性值，不反向修改代码
const handlePropsChange = (newProps) => {
  console.log('Props changed:', newProps)
  componentProps.value = { ...newProps }
  // 不再反向修改代码
}

// 应用模板
const applyTemplate = (template) => {
  code.value = template.code
  handleCodeChange(template.code)
}

// 处理预览错误
const handlePreviewError = (error) => {
  console.error('预览错误:', error)
}

// 初始化
onMounted(() => {
  applyTemplate({ code: defaultCode })
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-panel {
  width: 40%;
  height: 100%;
}

.center-panel {
  width: 35%;
  height: 100%;
  border-left: 1px solid #dcdfe6;
  border-right: 1px solid #dcdfe6;
}

.right-panel {
  width: 25%;
  height: 100%;
  overflow: auto;
}
</style>
