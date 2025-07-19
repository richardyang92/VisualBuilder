<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>属性配置</h3>
    </div>
    <div class="panel-content">
      <el-form v-if="propsSchema.length > 0" label-position="top">
        <el-form-item 
          v-for="prop in propsSchema" 
          :key="prop.name"
          :label="prop.name"
        >
          <component 
            :is="getInputComponent(prop.type)"
            v-model="propsValues[prop.name]"
            :placeholder="`请输入${prop.name}`"
            @change="handlePropChange(prop.name, $event)"
          />
          <div class="prop-description" v-if="prop.default">
            默认值: {{ prop.default }}
          </div>
        </el-form-item>
      </el-form>
      <div v-else class="no-props">
        <el-empty description="暂无属性配置" />
      </div>
    </div>
    
    <div class="style-panel">
      <div class="panel-header">
        <h3>样式配置</h3>
      </div>
      <div class="panel-content">
        <div v-if="componentStyles.length > 0">
          <div v-for="(style, index) in componentStyles" :key="index" class="style-section">
            <div class="style-header">
              <span class="style-title">样式 {{ index + 1 }}</span>
              <el-tag v-if="style.scoped" size="small" type="info">scoped</el-tag>
            </div>
            <el-input
              v-model="style.content"
              type="textarea"
              :rows="8"
              @input="handleStyleContentChange(index, $event)"
            />
          </div>
        </div>
        <div v-else class="no-styles">
          <el-empty description="暂无样式配置" />
        </div>
        
        <div class="style-actions">
          <el-button size="small" @click="resetStyles">重置样式</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  propsSchema: {
    type: Array,
    default: () => []
  },
  propsValues: {
    type: Object,
    default: () => ({})
  },
  componentStyles: {
    type: Array,
    default: () => []
  },
  currentCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['props-change', 'style-change'])

// 本地样式数据
const localStyles = ref([])

// 获取对应的输入组件
const getInputComponent = (type) => {
  const componentMap = {
    string: 'el-input',
    number: 'el-input-number',
    boolean: 'el-switch',
    array: 'el-input',
    object: 'el-input'
  }
  return componentMap[type] || 'el-input'
}

// 处理属性变化
const handlePropChange = (propName, value) => {
  const newProps = { ...props.propsValues, [propName]: value }
  emit('props-change', newProps)
}

// 处理样式内容变化
const handleStyleContentChange = (index, content) => {
  localStyles.value[index].content = content
}

// 添加新样式
const addStyle = () => {
  localStyles.value.push({
    content: '',
    scoped: true
  })
}

// 应用样式
const applyStyles = () => {
  emit('style-change', localStyles.value)
}

// 重置样式
const resetStyles = () => {
  // 从当前代码中提取样式
  const code = props.currentCode || ''
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g
  const styles = []
  let match
  
  while ((match = styleRegex.exec(code)) !== null) {
    styles.push({
      content: match[1].trim(),
      scoped: match[0].includes('scoped')
    })
  }
  
  if (styles.length > 0) {
    // 更新本地样式和第一个样式编辑框
    localStyles.value = [...styles]
    emit('style-change', localStyles.value)
  } else {
    // 如果没有找到样式，清空样式
    localStyles.value = []
    emit('style-change', localStyles.value)
  }
}

// 监听组件样式变化
watch(() => props.componentStyles, (newStyles) => {
  localStyles.value = [...newStyles]
}, { immediate: true, deep: true })

// 监听props值变化
watch(() => props.propsValues, (newValues) => {
  // 可以在这里添加额外的处理逻辑
}, { deep: true })
</script>

<style scoped>
.property-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.style-panel {
  border-top: 1px solid #dcdfe6;
  max-height: 50%;
  display: flex;
  flex-direction: column;
}

.style-panel .panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.style-section {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.style-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.style-title {
  font-weight: bold;
  color: #303133;
}

.style-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.prop-description {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.no-props, .no-styles {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}
</style>
