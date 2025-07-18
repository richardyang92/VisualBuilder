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
        </div>
      </div>
    </div>
    
    <div class="toolbar-section">
      <button class="toolbar-btn" @click="handleExportVue">导出Vue文件</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showFileMenu = ref(false)
const showTemplateMenu = ref(false)
import { getBuiltinTemplates } from '../utils/vueParser'

const emit = defineEmits(['template-selected'])

const templates = ref([])
const selectedTemplateId = ref(null)

onMounted(() => {
  templates.value = getBuiltinTemplates()
  console.log('Templates loaded:', templates.value.map(t => ({id: t.id, name: t.name})))
  
  // 默认选中第一个模板（基础组件）
  if (templates.value.length > 0) {
    selectedTemplateId.value = templates.value[0].id
    emit('template-selected', templates.value[0])
  }
})

const selectTemplate = (template) => {
  selectedTemplateId.value = template.id
  emit('template-selected', template)
}

const handleNew = () => {
  // 新建文件逻辑
  console.log('新建文件')
}

const handleOpen = () => {
  // 打开文件逻辑
  console.log('打开文件')
}

const handleSave = () => {
  // 保存文件逻辑
  console.log('保存文件')
}

const handleExportVue = () => {
  // 导出Vue文件逻辑
  console.log('导出Vue文件')
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
