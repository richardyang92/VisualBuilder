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
  console.log('Generating preview with props:', props)
  console.log('Generating preview with styles:', componentStyles)
  
  // 提取模板内容
  const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/)
  const template = templateMatch ? templateMatch[1] : '<div>组件无模板</div>'
  
  // 提取脚本内容
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  const script = scriptMatch ? scriptMatch[1] : ''
  
  // 构建样式内容
  let stylesContent = ''
  if (componentStyles && componentStyles.length > 0) {
    stylesContent = componentStyles.map(style => style.content).join('\n')
  }
  
  // 获取匹配的模板默认值
  const templates = getBuiltinTemplates()
  const matchedTemplate = templates.find(t => 
    t.code.includes('<template>') && 
    t.code.includes('</template>') &&
    t.code.includes(code)
  )
  
  // 使用模板默认值或传入的props
  const propsData = props || {}
  const defaultProps = matchedTemplate ? 
    parseVueComponent(matchedTemplate.code).props.reduce((acc, prop) => {
      acc[prop.name] = prop.default
      return acc
    }, {}) : {}
    
  const finalProps = { ...defaultProps, ...propsData }
  console.log('Final props data:', finalProps)
  
  const propsBinding = Object.keys(finalProps)
    .map(key => {
      const value = propsData[key]
      console.log(`Prop binding: ${key} = ${value}`)
      return `:${key}="\`${value}\`"`
    })
    .join(' ')
  
  console.log('Final props binding:', propsBinding)
  
  // 将finalProps转换为字符串以便在iframe中使用
  const finalPropsStr = JSON.stringify(finalProps)
  
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
  <div id="app">
    <preview-component ${propsBinding}></preview-component>
  </div>

  <script>
    const { createApp, defineProps, defineEmits, reactive } = Vue
    
    // 获取从父窗口传递的props
    const finalProps = ${finalPropsStr}
    
    // 创建预览组件
    const PreviewComponent = {
      props: Object.fromEntries(
        Object.entries(finalProps).map(([key, value]) => 
          [key, { type: String, default: value }]
        )
      ),
      emits: ['click', 'submit'],
      setup(props, { emit }) {
        console.log('PreviewComponent props:', props)
        const handleClick = () => {
          emit('click', '按钮被点击了')
        }
        
        const handleSubmit = (form) => {
          emit('submit', form)
        }
        
        const form = reactive({
          username: '',
          email: ''
        })
        
        return {
          handleClick,
          handleSubmit,
          form
        }
      },
      template: \`${template}\`
    }
    
    const app = createApp({
      components: {
        PreviewComponent
      }
    })
    
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
