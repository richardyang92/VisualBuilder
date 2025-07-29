<template>
  <div class="app-container">
    <Toolbar ref="toolbarRef" @template-selected="applyTemplate" @save-template="handleSaveTemplate" @export-vue="handleExportVue" @load-template="handleLoadTemplate" />
    <div class="main-content">
      <div class="left-panel">
        <Editor v-model="code" @code-change="handleCodeChange" />
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
import { ref, computed, onMounted } from 'vue'
import Toolbar from './components/Toolbar.vue'
import Editor from './components/Editor.vue'
import Preview from './components/Preview.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import { parseVueComponent, generateVueComponent, updateVueComponentStyles, updateVueComponentPropDefault, getDefaultCode } from './utils/vueParser'

const code = ref('')
const toolbarRef = ref(null)

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
