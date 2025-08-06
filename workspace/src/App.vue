<template>
  <div class="app-container">
    <Toolbar ref="toolbarRef" @template-selected="applyTemplate" @save-template="handleSaveTemplate" @export-vue="handleExportVue" @load-template="handleLoadTemplate" @toggle-theme="handleThemeChange" :is-dark-theme="isDarkTheme" />
    <div class="main-content">
      <div class="left-panel">
        <Editor v-model="code" @code-change="handleCodeChange" :is-dark-theme="isDarkTheme" />
      </div>
      <div class="center-panel">
        <Preview :code="code" :props="componentProps" :component-styles="componentStyles" @error="handlePreviewError" />
      </div>
      <div class="right-panel">
        <PropertyPanel 
          :props-schema="propsSchema" 
          :props-values="componentProps"
          :component-styles="componentStyles"
          :current-code="code"
          @props-change="handlePropsChange"
          @style-change="handleStyleChange"
          @default-change="handleDefaultChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Toolbar from './components/Toolbar.vue'
import Editor from './components/Editor.vue'
import Preview from './components/Preview.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import { parseVueComponent, generateVueComponent, updateVueComponentStyles, updateVueComponentPropDefault, getDefaultCode } from './utils/vueParser'

const code = ref('')
const toolbarRef = ref(null)
const isDarkTheme = ref(false)

const componentProps = ref({})
const propsSchema = ref([])
const componentStyles = ref([])

// 解析Vue组件的props和样式
const handleCodeChange = (newCode) => {
  try {
    const parsed = parseVueComponent(newCode)
    console.log('Parsed component props:', parsed.props)
    console.log('Parsed component styles:', parsed.styles)
    propsSchema.value = parsed.props || []
    componentStyles.value = parsed.styles || []
    
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

// 处理样式变化
const handleStyleChange = (newStyles) => {
  console.log('Styles changed:', newStyles)
  componentStyles.value = [...newStyles]
  
  // 更新代码编辑器中的样式
  const updatedCode = updateVueComponentStyles(code.value, newStyles)
  code.value = updatedCode
}

// 应用模板
const applyTemplate = (template) => {
  code.value = template.code
  handleCodeChange(template.code)
}

// 处理加载的模板
const handleLoadTemplate = (template) => {
  // 应用加载的模板
  console.log('加载模板:', template)
  applyTemplate(template)
  alert('模板加载成功！')
}

// 处理预览错误
const handlePreviewError = (error) => {
  console.error('预览错误:', error)
}

// 处理默认值变化
const handleDefaultChange = (data) => {
  console.log('默认值变化:', data)
  // 更新代码中的默认值
  const { propName, defaultValue } = data
  const updatedCode = updateVueComponentPropDefault(code.value, propName, defaultValue)
  code.value = updatedCode
  
  // 重新解析更新后的代码
  handleCodeChange(updatedCode)
}

// 处理保存为自定义模板
const handleSaveTemplate = () => {
  // 保存为自定义模板逻辑 - 下载为JSON文件
  console.log('保存为自定义模板文件')
  
  // 创建模板JSON对象
  const templateData = {
    name: '自定义模板',
    description: '用户自定义的组件模板',
    code: code.value
  }
  
  // 创建Blob对象
  const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json;charset=utf-8' })
  
  // 创建下载链接
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'template-' + new Date().getTime() + '.json'
  
  // 触发下载
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  alert('模板文件保存成功！')
}

// 处理导出Vue文件
const handleExportVue = () => {
  // 导出Vue文件逻辑
  console.log('导出Vue文件')
  
  // 创建Blob对象
  const blob = new Blob([code.value], { type: 'text/plain;charset=utf-8' })
  
  // 创建下载链接
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'component.vue'
  
  // 触发下载
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 初始化
onMounted(async () => {
  const defaultCode = await getDefaultCode()
  code.value = defaultCode
  handleCodeChange(defaultCode)
  
  // 检查系统主题偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDarkTheme.value = prefersDark
  updateTheme()
})

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  isDarkTheme.value = e.matches
  updateTheme()
})

// 更新主题
const updateTheme = () => {
  const root = document.documentElement
  
  if (isDarkTheme.value) {
    // 暗色主题
    root.style.setProperty('--bg-primary', '#1e293b')
    root.style.setProperty('--bg-secondary', '#0f172a')
    root.style.setProperty('--bg-tertiary', '#1e293b')
    root.style.setProperty('--text-primary', '#f1f5f9')
    root.style.setProperty('--text-secondary', '#cbd5e1')
    root.style.setProperty('--text-tertiary', '#94a3b8')
    root.style.setProperty('--border-color', '#334155')
    root.style.setProperty('--border-light', '#334155')
  } else {
    // 亮色主题
    root.style.setProperty('--bg-primary', '#ffffff')
    root.style.setProperty('--bg-secondary', '#f8fafc')
    root.style.setProperty('--bg-tertiary', '#f1f5f9')
    root.style.setProperty('--text-primary', '#1e293b')
    root.style.setProperty('--text-secondary', '#64748b')
    root.style.setProperty('--text-tertiary', '#94a3b8')
    root.style.setProperty('--border-color', '#e2e8f0')
    root.style.setProperty('--border-light', '#f1f5f9')
  }
}

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  updateTheme()
}

// 处理来自工具栏的主题切换事件
const handleThemeChange = (isDark) => {
  isDarkTheme.value = isDark
  updateTheme()
}

// 暴露切换主题方法给子组件
defineExpose({
  toggleTheme
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-secondary);
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1px;
  background-color: var(--border-color);
}

.left-panel {
  width: 40%;
  height: 100%;
  background-color: var(--bg-primary);
  overflow: hidden;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.center-panel {
  width: 35%;
  height: 100%;
  background-color: var(--bg-primary);
  overflow: hidden;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.right-panel {
  width: 25%;
  height: 100%;
  background-color: var(--bg-primary);
  overflow: hidden;
  border-left: 1px solid var(--border-color);
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

/* 面板通用样式 */
.panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-header h3::before {
  content: '';
  width: 4px;
  height: 16px;
  background-color: var(--primary-color);
  border-radius: var(--radius-sm);
}

.panel-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: var(--bg-primary);
}

/* 滚动条美化 */
.left-panel::-webkit-scrollbar,
.center-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar {
  width: 6px;
}

.left-panel::-webkit-scrollbar-track,
.center-panel::-webkit-scrollbar-track,
.right-panel::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

.left-panel::-webkit-scrollbar-thumb,
.center-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb:hover,
.center-panel::-webkit-scrollbar-thumb:hover,
.right-panel::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* 面板之间的分隔线增强 */
.main-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 40%;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, var(--border-color), transparent);
  z-index: 10;
}

.main-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 75%;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, var(--border-color), transparent);
  z-index: 10;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .left-panel {
    width: 100%;
    height: 33.33%;
  }
  
  .center-panel {
    width: 100%;
    height: 33.33%;
  }
  
  .right-panel {
    width: 100%;
    height: 33.33%;
    border-left: none;
    border-top: 1px solid var(--border-color);
  }
  
  .main-content::before,
  .main-content::after {
    display: none;
  }
}
</style>
