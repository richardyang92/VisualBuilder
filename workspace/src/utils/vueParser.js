import { compileScript, parse } from '@vue/compiler-sfc'

/**
 * 解析Vue组件代码，提取props定义
 * @param {string} code - Vue组件代码
 * @returns {object} 解析结果
 */
export function parseVueComponent(code) {
  try {
    const props = []
    
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
    
    console.log('解析到的props:', props)
    return {
      props,
      template: '',
      script: '',
      styles: []
    }
  } catch (error) {
    console.error('解析Vue组件失败:', error)
    return { props: [], template: '', script: '', styles: [] }
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
    <el-button type="primary" @click="handleClick">{{ buttonText }}</el-button>
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
</style>`
    ),
    createTemplate(
      '卡片组件',
      'Element Plus卡片组件示例',
      `<template>
  <el-card :header="title" class="card-component">
    <p>{{ content }}</p>
    <div class="card-footer">
      <el-button type="primary" size="small">{{ buttonText }}</el-button>
    </div>
  </el-card>
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
}
.card-footer {
  margin-top: 20px;
  text-align: right;
}
</style>`
    ),
    createTemplate(
      '表单组件',
      '包含输入框和按钮的表单组件',
      `<template>
  <el-form :model="form" label-width="80px" class="form-component">
    <el-form-item label="用户名">
      <el-input v-model="form.username" :placeholder="usernamePlaceholder" />
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model="form.email" :placeholder="emailPlaceholder" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">{{ submitText }}</el-button>
    </el-form-item>
  </el-form>
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
</style>`
    )
  ]
}
