import { compileScript, parse } from '@vue/compiler-sfc'

/**
 * 解析Vue组件代码，提取props定义和样式
 * @param {string} code - Vue组件代码
 * @returns {object} 解析结果
 */
export function parseVueComponent(code) {
  try {
    const props = []
    const styles = []
    
    // 使用正则直接提取所有prop定义
    const propRegex = /(\w+)\s*:\s*{[^}]*default\s*:\s*['"`]([^'"`]+)['"`]/g
    let match
    
    while ((match = propRegex.exec(code)) !== null) {
      props.push({
        name: match[1],
        type: 'string',
        default: match[2]
      })
    }
    
    // 如果没有找到带默认值的prop，查找所有prop
    if (props.length === 0) {
      const allPropRegex = /(\w+)\s*:\s*(?:{[^}]*}|String|Number|Boolean)/g
      while ((match = allPropRegex.exec(code)) !== null) {
        // 检查是否已经添加过
        if (!props.find(p => p.name === match[1])) {
          // 查找这个prop的默认值
          const defaultRegex = new RegExp(`${match[1]}\\s*:\\s*{[^}]*default\\s*:\\s*['"\`]([^'"}\`]+)['"\`]`)
          const defaultMatch = code.match(defaultRegex)
          
          props.push({
            name: match[1],
            type: 'string',
            default: defaultMatch ? defaultMatch[1] : ''
          })
        }
      }
    }
    
    // 提取样式内容
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g
    let styleMatch
    while ((styleMatch = styleRegex.exec(code)) !== null) {
      styles.push({
        content: styleMatch[1].trim(),
        scoped: styleMatch[0].includes('scoped')
      })
    }
    
    console.log('解析到的props:', props)
    console.log('解析到的样式:', styles)
    return {
      props,
      template: '',
      script: '',
      styles
    }
  } catch (error) {
    console.error('解析Vue组件失败:', error)
    return { props: [], template: '', script: [], styles: [] }
  }
}

/**
 * 根据新的props值生成更新后的Vue组件代码
 * @param {string} originalCode - 原始代码
 * @param {object} newProps - 新的props值
 * @returns {string} 更新后的代码
 */
export function generateVueComponent(originalCode, newProps) {
  // 这个函数现在不再需要，因为不需要反向更新代码
  return originalCode
}

/**
 * 根据新的样式更新Vue组件代码
 * @param {string} originalCode - 原始代码
 * @param {Array} newStyles - 新的样式数组
 * @returns {string} 更新后的代码
 */
export function updateVueComponentStyles(originalCode, newStyles) {
  // 如果没有样式，直接返回原始代码
  if (!newStyles || newStyles.length === 0) {
    return originalCode
  }
  
  // 生成新的样式内容
  let newStyleContent = ''
  newStyles.forEach(style => {
    const scopedAttr = style.scoped ? ' scoped' : ''
    newStyleContent += `<style${scopedAttr}>\n${style.content}\n</style>\n`
  })
  
  // 检查原始代码中是否有<style>标签
  const styleRegex = /<style[^>]*>[\s\S]*?<\/style>\s*/g
  const hasStyleTag = styleRegex.test(originalCode)
  
  if (hasStyleTag) {
    // 如果有<style>标签，替换它
    return originalCode.replace(styleRegex, newStyleContent)
  } else {
    // 如果没有<style>标签，将新样式添加到代码末尾
    // 但要在</script>标签之后
    const scriptRegex = /<\/script>\s*/
    if (scriptRegex.test(originalCode)) {
      return originalCode.replace(scriptRegex, `</script>\n\n${newStyleContent}`)
    } else {
      // 如果连</script>标签都没有，直接添加到末尾
      return originalCode + `\n\n${newStyleContent}`
    }
  }
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 创建组件模板
 * @param {string} name - 模板名称
 * @param {string} description - 模板描述
 * @param {string} code - 模板代码
 * @returns {object} 模板对象
 */
export function createTemplate(name, description, code) {
  return {
    id: generateUUID(),
    name,
    description,
    code,
    preview: null
  }
}

/**
 * 获取内置模板列表
 * @returns {Array} 模板列表
 */
export function getBuiltinTemplates() {
  return [
    createTemplate(
      '基础组件',
      '包含基本props的Vue3组件',
      `<template>
  <div class="basic-component">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <button class="btn-primary" @click="handleClick">{{ buttonText }}</button>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '标题'
  },
  description: {
    type: String,
    default: '这是一个描述文本'
  },
  buttonText: {
    type: String,
    default: '点击按钮'
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', '按钮被点击了')
}
</script>

<style scoped>
.basic-component {
  padding: 20px;
  text-align: center;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>`
    ),
    createTemplate(
      '卡片组件',
      '原生HTML卡片组件示例',
      `<template>
  <div class="card-component">
    <div class="card-header">
      <h3>{{ title }}</h3>
    </div>
    <div class="card-body">
      <p>{{ content }}</p>
      <div class="card-footer">
        <button class="btn-primary btn-small">{{ buttonText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '卡片标题'
  },
  content: {
    type: String,
    default: '这是卡片的内容文本'
  },
  buttonText: {
    type: String,
    default: '操作按钮'
  }
})
</script>

<style scoped>
.card-component {
  max-width: 400px;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background-color: #f5f5f5;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.card-body {
  padding: 20px;
}

.card-footer {
  margin-top: 20px;
  text-align: right;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>`
    ),
    createTemplate(
      '表单组件',
      '包含输入框和按钮的原生表单组件',
      `<template>
  <form class="form-component" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>用户名</label>
      <input 
        type="text" 
        v-model="form.username" 
        :placeholder="usernamePlaceholder"
        class="form-input"
      />
    </div>
    <div class="form-group">
      <label>邮箱</label>
      <input 
        type="email" 
        v-model="form.email" 
        :placeholder="emailPlaceholder"
        class="form-input"
      />
    </div>
    <div class="form-group">
      <button type="submit" class="btn-primary">{{ submitText }}</button>
    </div>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  usernamePlaceholder: {
    type: String,
    default: '请输入用户名'
  },
  emailPlaceholder: {
    type: String,
    default: '请输入邮箱地址'
  },
  submitText: {
    type: String,
    default: '提交'
  }
})

const emit = defineEmits(['submit'])

const form = reactive({
  username: '',
  email: ''
})

const handleSubmit = () => {
  emit('submit', form)
}
</script>

<style scoped>
.form-component {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>`
    )
  ]
}
