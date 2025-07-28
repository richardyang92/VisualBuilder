<template>
  <div class="preview-container">
    <div class="preview-header">
      <h3>实时预览</h3>
      <el-button size="small" @click="refreshPreview">刷新</el-button>
    </div>
    <div class="preview-content">
      <iframe 
        ref="previewFrame"
        class="preview-iframe"
        sandbox="allow-scripts"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { getBuiltinTemplates, parseVueComponent } from '../utils/vueParser'

const props = defineProps({
  code: {
    type: String,
    default: ''
  },
  props: {
    type: Object,
    default: () => ({})
  },
  componentStyles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['error'])

const previewFrame = ref(null)

  // 生成完整的HTML内容
  const generatePreviewHTML = (code, props, componentStyles) => {
    console.log('Generating preview with code:', code)
    
    // 提取样式内容
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/)
    const componentStyle = styleMatch ? styleMatch[1] : ''
    
    // 构建样式内容
    let stylesContent = componentStyle
    if (componentStyles && componentStyles.length > 0) {
      const externalStyles = componentStyles.map(style => style.content).join('\n')
      stylesContent = stylesContent + '\n' + externalStyles
    }
    
    // 使用完整的Vue组件代码
    const vueCode = code
    
    // 提取模板和脚本
    const templateMatch = vueCode.match(/<template[^>]*>([\s\S]*?)<\/template>/)
    const template = templateMatch ? templateMatch[1] : '<div>无模板</div>'
    
    const scriptMatch = vueCode.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    const script = scriptMatch ? scriptMatch[1] : ''
    
    // 处理脚本内容
    let processedScript = script
    
    // 移除import语句，但保留reactive等API的使用
    processedScript = processedScript.replace(/import\s+.*?from\s+['"][^'"]*['"]\s*;?/g, '')
    
    // 构建props对象
    const propsJSON = JSON.stringify(props || {})
    
    // 转义模板内容
    const escapedTemplate = template
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Preview</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    ${stylesContent}
  </style>
</head>
<body>
  <div id="app"></div>

  <script>
    const props = ${propsJSON};
    
    // 创建组件定义
    const componentDef = {
      template: \`${escapedTemplate}\`,
      data() {
        return { 
          ...props,
          form: {
            username: '',
            email: ''
          }
        };
      },
      methods: {
        handleClick() {
          console.log('Button clicked');
        },
        handleSubmit() {
          console.log('Form submitted', this.form);
        }
      }
    }
    
    const app = Vue.createApp(componentDef)
    app.mount('#app')
  <\/script>
</body>
</html>
  `
}

// 渲染预览
const renderPreview = () => {
  if (!previewFrame.value || !props.code) return
  
  try {
    const html = generatePreviewHTML(props.code, props.props, props.componentStyles)
    
    // 使用srcdoc避免跨域问题
    previewFrame.value.srcdoc = html
    
  } catch (err) {
    console.error('预览错误:', err)
    emit('error', err)
  }
}

// 刷新预览
const refreshPreview = () => {
  renderPreview()
}

// 监听代码、props和样式变化
watch(() => [props.code, props.props, props.componentStyles], () => {
  nextTick(() => {
    renderPreview()
  })
}, { immediate: true, deep: true })
</script>

<style scoped>
.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #dcdfe6;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.preview-content {
  flex: 1;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}
</style>
