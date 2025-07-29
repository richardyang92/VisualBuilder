<template>
  <div class="toolbar">
    <div class="toolbar-section">
      <div class="dropdown" @mouseenter="showFileMenu = true" @mouseleave="showFileMenu = false">
        <button class="dropdown-toggle">
          文件
          <span class="dropdown-arrow">▼</span>
        </button>
        <div class="dropdown-menu" v-show="showFileMenu">
          <button class="dropdown-item" @click="handleNew">新建</button>
          <button class="dropdown-item" @click="handleOpen">打开</button>
          <button class="dropdown-item" @click="handleSave">保存</button>
        </div>
      </div>
    </div>
    
    <div class="toolbar-section">
      <div class="dropdown" @mouseenter="showTemplateMenu = true" @mouseleave="showTemplateMenu = false">
        <button class="dropdown-toggle">
          模板
          <span class="dropdown-arrow">▼</span>
        </button>
        <div class="dropdown-menu" v-show="showTemplateMenu">
          <button 
            v-for="template in templates" 
            :key="template.id"
            :class="['dropdown-item', { 'active': selectedTemplateId === template.id }]"
            @click="selectTemplate(template)"
          >
            {{ template.name }}
            <span v-if="selectedTemplateId === template.id" class="debug">✓</span>
          </button>
          <div class="dropdown-divider"></div>
          <button 
            :class="['dropdown-item', { 'active': selectedTemplateId === 'custom' }]"
            @click="selectCustomMode"
          >
            自定义模式
            <span v-if="selectedTemplateId === 'custom'" class="debug">✓</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="toolbar-section">
      <button class="toolbar-btn" @click="handleExportVue">导出Vue文件</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getBuiltinTemplates, loadTemplate } from '../utils/vueParser'

const showFileMenu = ref(false)
const showTemplateMenu = ref(false)

const emit = defineEmits(['template-selected', 'save-template', 'export-vue', 'load-template'])

const builtinTemplates = ref([])
const selectedTemplateId = ref(null)
const emptyTemplate = ref('')

onMounted(async () => {
  // 获取内置模板
  try {
    builtinTemplates.value = await getBuiltinTemplates()
    
    console.log('Builtin templates loaded:', builtinTemplates.value.map(t => ({id: t.id, name: t.name})))
    
    // 默认选中第一个模板（基础组件）
    if (builtinTemplates.value.length > 0) {
      selectedTemplateId.value = builtinTemplates.value[0].id
      emit('template-selected', builtinTemplates.value[0])
    }
    
    // 加载空模板
    try {
      const emptyTemplateData = await loadTemplate('empty-template.json')
      emptyTemplate.value = emptyTemplateData.code
    } catch (error) {
      console.error('Failed to load empty template:', error)
    }
  } catch (error) {
    console.error('Failed to load builtin templates:', error)
  }
})

const templates = computed(() => {
  return [...builtinTemplates.value]
})

const selectTemplate = (template) => {
  selectedTemplateId.value = template.id
  emit('template-selected', template)
}

const selectCustomMode = () => {
  selectedTemplateId.value = 'custom'
  emit('template-selected', { 
    id: 'custom', 
    name: '自定义模式', 
    code: emptyTemplate.value 
  })
}

const handleNew = () => {
  // 新建文件 - 切换到自定义模式
  selectCustomMode()
}

const handleOpen = () => {
  // 打开文件逻辑 - 加载本地JSON模板文件
  console.log('打开文件')
  
  // 创建文件输入元素
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = '.json'
  
  // 设置文件选择后的回调
  fileInput.onchange = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // 读取文件内容
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        // 解析JSON内容
        const templateData = JSON.parse(e.target.result)
        
        // 验证模板数据结构
        if (!templateData.code) {
          throw new Error('Invalid template format: missing code property')
        }
        
        // 生成模板对象
        const template = {
          id: 'local-' + Date.now(), // 生成唯一ID
          name: templateData.name || '本地模板',
          description: templateData.description || '从本地文件加载的模板',
          code: templateData.code
        }
        
        // 发送事件到父组件
        emit('load-template', template)
      } catch (error) {
        console.error('Failed to load template file:', error)
        alert('加载模板文件失败: ' + error.message)
      }
    }
    
    reader.onerror = () => {
      console.error('Failed to read file')
      alert('读取文件失败')
    }
    
    // 读取文件为文本
    reader.readAsText(file)
  }
  
  // 触发文件选择对话框
  fileInput.click()
}

const handleSave = () => {
  // 保存为自定义模板 - 调用父组件的保存方法
  console.log('保存为自定义模板')
  emit('save-template')
}

const handleExportVue = () => {
  // 导出Vue文件逻辑
  console.log('导出Vue文件')
  emit('export-vue')
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-section {
  position: relative;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-arrow {
  font-size: 10px;
  margin-left: 4px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 160px;
  background-color: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 4px 0;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  text-align: left;
  font-size: 13px;
  color: #606266;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.dropdown-item.active {
  background-color: #409eff;
  color: white;
}

.dropdown-divider {
  height: 1px;
  background-color: #e4e7ed;
  margin: 4px 0;
}

.toolbar-btn {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.debug {
  margin-left: 4px;
  font-size: 10px;
}
</style>
