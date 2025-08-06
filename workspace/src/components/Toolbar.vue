<template>
  <div class="toolbar">
    <div class="toolbar-section">
      <div class="dropdown" 
           @mouseenter="showFileMenu = true" 
           @mouseleave="handleDropdownLeave('file')">
        <button class="dropdown-toggle">
          文件
          <span class="dropdown-arrow">▼</span>
        </button>
        <div class="dropdown-menu" 
             v-show="showFileMenu"
             @mouseenter="showFileMenu = true"
             @mouseleave="handleDropdownLeave('file')">
          <button class="dropdown-item" @click="handleNew">新建</button>
          <button class="dropdown-item" @click="handleOpen">打开</button>
          <button class="dropdown-item" @click="handleSave">保存</button>
        </div>
      </div>
    </div>
    
    <div class="toolbar-section">
      <div class="dropdown" 
           @mouseenter="showTemplateMenu = true" 
           @mouseleave="handleDropdownLeave('template')">
        <button class="dropdown-toggle">
          模板
          <span class="dropdown-arrow">▼</span>
        </button>
        <div class="dropdown-menu" 
             v-show="showTemplateMenu"
             @mouseenter="showTemplateMenu = true"
             @mouseleave="handleDropdownLeave('template')">
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
    
    <div class="toolbar-section">
      <button class="toolbar-btn theme-toggle" @click="toggleTheme">
        {{ isDarkTheme ? '☀️ 日间模式' : '🌙 夜间模式' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getBuiltinTemplates, loadTemplate } from '../utils/vueParser'

const showFileMenu = ref(false)
const showTemplateMenu = ref(false)
const isDarkTheme = ref(false)

const emit = defineEmits(['template-selected', 'save-template', 'export-vue', 'load-template', 'toggle-theme'])

// 接收来自父组件的主题状态
const props = defineProps({
  isDarkTheme: {
    type: Boolean,
    default: false
  }
})

// 监听主题状态变化，更新本地状态
watch(() => props.isDarkTheme, (newTheme) => {
  isDarkTheme.value = newTheme
})

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

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  emit('toggle-theme', isDarkTheme.value)
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.toolbar-section {
  position: relative;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-fast);
}

.dropdown-toggle:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.dropdown-arrow {
  font-size: 0.625rem;
  margin-left: 0.25rem;
  transition: transform var(--transition-fast);
}

.dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 180px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  padding: 0.5rem 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-0.5rem);
  transition: all var(--transition-normal);
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: #1e293b;
  background-color: #ffffff;
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
  gap: 0.5rem;
  border-radius: 0 !important;
  margin: 0 !important;
}

.dropdown-item:hover {
  background-color: #f8fafc;
  color: #3b82f6;
}

.dropdown-item.active {
  background-color: #3b82f6;
  color: white;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0.5rem 0;
}

.toolbar-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-btn:hover {
  background-color: var(--bg-secondary);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.theme-toggle {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
  font-weight: 500;
}

.theme-toggle:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.debug {
  margin-left: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }
  
  .dropdown-toggle,
  .toolbar-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .dropdown-menu {
    min-width: 140px;
  }
}

/* 确保Element Plus的下拉菜单样式正确 */
:deep(.el-dropdown-menu) {
  background-color: var(--bg-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-lg) !important;
  padding: 0.5rem 0 !important;
}

:deep(.el-dropdown-menu__item) {
  color: var(--text-primary) !important;
  font-size: 0.875rem !important;
  padding: 0.5rem 1rem !important;
  margin: 0 !important;
  border-radius: 0 !important;
  transition: all var(--transition-fast) !important;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: var(--bg-secondary) !important;
  color: var(--primary-color) !important;
}

:deep(.el-dropdown-menu__item.is-active) {
  background-color: var(--primary-color) !important;
  color: white !important;
}

:deep(.el-dropdown-menu__item.is-divided) {
  border-top: 1px solid var(--border-color) !important;
  margin-top: 0.5rem !important;
  padding-top: 0.5rem !important;
}
</style>
