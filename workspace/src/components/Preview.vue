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
import { parseVueComponent } from '../utils/vueParser'

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
  background-color: var(--bg-primary);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  flex-shrink: 0;
}

.preview-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-header h3::before {
  content: '👁️';
  font-size: 1rem;
}

.preview-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #f8fafc;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

/* 预览加载状态 */
.preview-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
}

.preview-loading::before {
  content: '';
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 预览错误状态 */
.preview-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--error-color);
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--error-color);
  box-shadow: var(--shadow-md);
  max-width: 80%;
}

.preview-error h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.preview-error p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-header {
    padding: 0.75rem;
  }
  
  .preview-header h3 {
    font-size: 0.75rem;
  }
  
  .preview-error {
    padding: 1rem;
    max-width: 90%;
  }
  
  .preview-error h4 {
    font-size: 0.875rem;
  }
  
  .preview-error p {
    font-size: 0.75rem;
  }
}
</style>
