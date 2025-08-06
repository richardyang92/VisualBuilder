<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>属性配置</h3>
      <el-button 
        type="text" 
        @click="togglePropsPanel"
        class="collapse-btn"
      >
        <el-icon>
          <ArrowUp v-if="propsPanelExpanded" />
          <ArrowDown v-else />
        </el-icon>
      </el-button>
    </div>
    <div class="props-panel" :class="{ 'full-height': !stylesPanelExpanded }" v-if="propsPanelExpanded">
      <div class="panel-content">
        <el-form v-if="propsSchema.length > 0" label-position="top">
          <el-form-item 
            v-for="prop in propsSchema" 
            :key="prop.name"
            :label="prop.name"
          >
            <div class="prop-description" v-if="prop.default !== undefined">
              默认值: 
              <component 
                :is="getInputComponent(prop.type)"
                :model-value="prop.default"
                @update:model-value="handleDefaultChange(prop, $event)"
                :placeholder="`默认值: ${prop.default}`"
                size="small"
                style="width: auto; display: inline-block; margin-left: 8px;"
              />
            </div>
          </el-form-item>
        </el-form>
        <div v-else class="no-props">
          <el-empty description="暂无属性配置" />
        </div>
      </div>
    </div>
    
    <div class="panel-header">
      <h3>样式配置</h3>
      <el-button 
        type="text" 
        @click="toggleStylesPanel"
        class="collapse-btn"
      >
        <el-icon>
          <ArrowUp v-if="stylesPanelExpanded" />
          <ArrowDown v-else />
        </el-icon>
      </el-button>
    </div>
    <div class="style-panel" :class="{ 'full-height': !propsPanelExpanded }" v-if="stylesPanelExpanded">
      <div class="panel-content">
        <div v-if="parsedStyles.length > 0">
          <div v-for="(styleRule, index) in parsedStyles" :key="index" class="style-rule-section">
            <div class="style-rule-header">
              <el-input
                v-model="styleRule.selector"
                @input="handleStyleRuleNameChange(index, $event)"
                placeholder="请输入选择器"
                size="small"
              />
            </div>
            <div class="style-properties">
              <el-form label-position="left" label-width="180px">
                <el-form-item 
                  v-for="(property, propIndex) in styleRule.properties" 
                  :key="propIndex"
                  :label="formatPropertyName(property.name)"

                >
                  <div class="property-input-row">
                    <el-color-picker
                      v-if="isColorProperty(property.name)"
                      v-model="property.value"
                      @change="handleStylePropertyChange(styleRule.selector, property.name, $event)"
                      @active-change="handleStylePropertyChange(styleRule.selector, property.name, $event)"
                      show-alpha
                    />
                    <el-input
                      v-else
                      v-model="property.value"
                      @input="handleStylePropertyChange(styleRule.selector, property.name, $event)"
                      :placeholder="getDefaultPropertyValue(property.name)"
                    />
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="deleteProperty(index, propIndex)"
                      class="delete-property-btn"
                    >
                      删除
                    </el-button>
                  </div>
                </el-form-item>
              </el-form>
              <div class="add-property-section">
                <el-select 
                  v-model="newPropertySelection[index]" 
                  placeholder="选择要添加的属性" 
                  size="small"
                  filterable
                >
                  <el-option
                    v-for="prop in availableProperties"
                    :key="prop.name"
                    :label="formatPropertyName(prop.name)"
                    :value="prop.name"
                  />
                </el-select>
                <el-button style="margin-top: 12px;" size="small" @click="addNewProperty(index)">添加属性</el-button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-styles">
          <el-empty description="暂无样式配置" />
        </div>
      </div>
      <div class="style-actions">
        <el-button size="small" @click="resetStyles">重置样式</el-button>
        <el-button size="small" @click="addNewStyleRule" type="primary">添加样式规则</el-button>
      </div>
    </div>
    <div v-if="!propsPanelExpanded && !stylesPanelExpanded" class="empty-state">
      <el-empty description="暂无配置项" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElColorPicker } from 'element-plus'

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

const emit = defineEmits(['props-change', 'style-change', 'default-change'])

// 本地样式数据
const localStyles = ref([])

// 解析后的样式规则
const parsedStyles = ref([])

// 新属性选择
const newPropertySelection = ref({})

// 面板折叠状态
const propsPanelExpanded = ref(true)
const stylesPanelExpanded = ref(true)

// 切换属性面板折叠状态
const togglePropsPanel = () => {
  propsPanelExpanded.value = !propsPanelExpanded.value
}

// 切换样式面板折叠状态
const toggleStylesPanel = () => {
  stylesPanelExpanded.value = !stylesPanelExpanded.value
}

// 可用的CSS属性列表
const availableProperties = [
  // 背景相关
  { name: 'background-color', value: '#ffffff' },
  { name: 'background-image', value: 'none' },
  { name: 'background-repeat', value: 'repeat' },
  { name: 'background-position', value: '0% 0%' },
  { name: 'background-size', value: 'auto' },
  
  // 文本相关
  { name: 'color', value: '#000000' },
  { name: 'font-family', value: 'Arial, sans-serif' },
  { name: 'font-size', value: '14px' },
  { name: 'font-weight', value: 'normal' },
  { name: 'font-style', value: 'normal' },
  { name: 'text-align', value: 'left' },
  { name: 'text-decoration', value: 'none' },
  { name: 'text-transform', value: 'none' },
  { name: 'line-height', value: 'normal' },
  { name: 'letter-spacing', value: 'normal' },
  { name: 'word-spacing', value: 'normal' },
  
  // 布局相关
  { name: 'display', value: 'block' },
  { name: 'position', value: 'static' },
  { name: 'top', value: 'auto' },
  { name: 'right', value: 'auto' },
  { name: 'bottom', value: 'auto' },
  { name: 'left', value: 'auto' },
  { name: 'float', value: 'none' },
  { name: 'clear', value: 'none' },
  { name: 'z-index', value: 'auto' },
  
  // 盒模型相关
  { name: 'width', value: 'auto' },
  { name: 'height', value: 'auto' },
  { name: 'min-width', value: '0' },
  { name: 'min-height', value: '0' },
  { name: 'max-width', value: 'none' },
  { name: 'max-height', value: 'none' },
  { name: 'padding', value: '0px' },
  { name: 'padding-top', value: '0px' },
  { name: 'padding-right', value: '0px' },
  { name: 'padding-bottom', value: '0px' },
  { name: 'padding-left', value: '0px' },
  { name: 'margin', value: '0px' },
  { name: 'margin-top', value: '0px' },
  { name: 'margin-right', value: '0px' },
  { name: 'margin-bottom', value: '0px' },
  { name: 'margin-left', value: '0px' },
  { name: 'border', value: 'none' },
  { name: 'border-width', value: 'medium' },
  { name: 'border-style', value: 'none' },
  { name: 'border-color', value: '#000000' },
  { name: 'border-radius', value: '0px' },
  { name: 'border-top-left-radius', value: '0px' },
  { name: 'border-top-right-radius', value: '0px' },
  { name: 'border-bottom-right-radius', value: '0px' },
  { name: 'border-bottom-left-radius', value: '0px' },
  
  // 其他常用属性
  { name: 'opacity', value: '1' },
  { name: 'visibility', value: 'visible' },
  { name: 'cursor', value: 'default' },
  { name: 'overflow', value: 'visible' },
  { name: 'overflow-x', value: 'visible' },
  { name: 'overflow-y', value: 'visible' },
  { name: 'box-shadow', value: 'none' },
  { name: 'text-shadow', value: 'none' },
  { name: 'transform', value: 'none' },
  { name: 'transition', value: 'all 0s ease 0s' },
  { name: 'animation', value: 'none' },
  { name: 'flex-direction', value: 'row' },
  { name: 'flex-wrap', value: 'nowrap' },
  { name: 'justify-content', value: 'flex-start' },
  { name: 'align-items', value: 'stretch' },
  { name: 'align-content', value: 'stretch' }
]

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

// 获取输入类型
const getInputType = (type) => {
  const typeMap = {
    string: 'text',
    number: 'number',
    boolean: 'checkbox',
    array: 'text',
    object: 'text'
  }
  return typeMap[type] || 'text'
}

// 处理属性变化
const handlePropChange = (propName, value) => {
  const newProps = { ...props.propsValues, [propName]: value }
  emit('props-change', newProps)
}

// 处理默认值变化
const handleDefaultChange = (prop, value) => {
  // 发出事件通知父组件默认值已更改
  console.log(`默认值变化: ${prop.name} = ${value}`)
  emit('default-change', { propName: prop.name, defaultValue: value })
}

// 解析CSS样式为属性配置
const parseCSSStyles = (cssContent) => {
  const rules = []
  // 匹配CSS规则
  const ruleRegex = /([^{]+)\{([^}]+)\}/g
  let match
  
  while ((match = ruleRegex.exec(cssContent)) !== null) {
    const selector = match[1].trim()
    const propertiesText = match[2].trim()
    
    // 解析属性
    const properties = []
    const propRegex = /([^:;]+):([^;]+);/g
    let propMatch
    
    while ((propMatch = propRegex.exec(propertiesText)) !== null) {
      properties.push({
        name: propMatch[1].trim(),
        value: propMatch[2].trim()
      })
    }
    
    rules.push({
      selector,
      properties
    })
  }
  
  return rules
}

// 格式化属性名称显示
const formatPropertyName = (name) => {
  const nameMap = {
    // 背景相关
    'background-color': '背景颜色',
    'background-image': '背景图片',
    'background-repeat': '背景重复',
    'background-position': '背景位置',
    'background-size': '背景尺寸',
    
    // 文本相关
    'color': '文字颜色',
    'font-family': '字体族',
    'font-size': '字体大小',
    'font-weight': '字体粗细',
    'font-style': '字体样式',
    'text-align': '文本对齐',
    'text-decoration': '文本装饰',
    'text-transform': '文本转换',
    'line-height': '行高',
    'letter-spacing': '字母间距',
    'word-spacing': '单词间距',
    
    // 布局相关
    'display': '显示方式',
    'position': '定位方式',
    'top': '顶部距离',
    'right': '右侧距离',
    'bottom': '底部距离',
    'left': '左侧距离',
    'float': '浮动',
    'clear': '清除浮动',
    'z-index': '层级',
    
    // 盒模型相关
    'width': '宽度',
    'height': '高度',
    'min-width': '最小宽度',
    'min-height': '最小高度',
    'max-width': '最大宽度',
    'max-height': '最大高度',
    'padding': '内边距',
    'padding-top': '上内边距',
    'padding-right': '右内边距',
    'padding-bottom': '下内边距',
    'padding-left': '左内边距',
    'margin': '外边距',
    'margin-top': '上外边距',
    'margin-right': '右外边距',
    'margin-bottom': '下外边距',
    'margin-left': '左外边距',
    'border': '边框',
    'border-width': '边框宽度',
    'border-style': '边框样式',
    'border-color': '边框颜色',
    'border-radius': '圆角',
    'border-top-left-radius': '左上圆角',
    'border-top-right-radius': '右上圆角',
    'border-bottom-right-radius': '右下圆角',
    'border-bottom-left-radius': '左下圆角',
    
    // 其他常用属性
    'opacity': '透明度',
    'visibility': '可见性',
    'cursor': '光标',
    'overflow': '溢出处理',
    'overflow-x': '水平溢出',
    'overflow-y': '垂直溢出',
    'box-shadow': '盒阴影',
    'text-shadow': '文字阴影',
    'transform': '变换',
    'transition': '过渡',
    'animation': '动画',
    'flex-direction': '弹性方向',
    'flex-wrap': '弹性换行',
    'justify-content': '主轴对齐',
    'align-items': '交叉轴对齐',
    'align-content': '内容对齐'
  }
  
  // 返回"中文名称(英文名称)"的格式
  const chineseName = nameMap[name] || name
  return `${chineseName}(${name})`
}

// 根据属性名称获取默认值
const getPropertyDefaultValue = (name) => {
  const defaultValue = availableProperties.find(prop => prop.name === name)?.value
  return defaultValue || ''
}

// 获取属性默认值提示
const getDefaultPropertyValue = (name) => {
  const defaultValues = {
    'background-color': '#ffffff',
    'color': '#000000',
    'font-size': '14px',
    'padding': '10px',
    'margin': '0px',
    'border': 'none',
    'border-radius': '0px',
    'width': 'auto',
    'height': 'auto'
  }
  
  return defaultValues[name] || ''
}

// 处理样式属性变化
const handleStylePropertyChange = (selector, propertyName, value) => {
  // 更新解析后的样式
  const ruleIndex = parsedStyles.value.findIndex(rule => rule.selector === selector)
  if (ruleIndex !== -1) {
    const propIndex = parsedStyles.value[ruleIndex].properties.findIndex(prop => prop.name === propertyName)
    if (propIndex !== -1) {
      parsedStyles.value[ruleIndex].properties[propIndex].value = value
    }
  }
  
  // 重新生成CSS内容
  regenerateCSSContent()
}

// 处理样式规则名称变化
const handleStyleRuleNameChange = (index, newName) => {
  // 更新解析后的样式规则名称
  if (index >= 0 && index < parsedStyles.value.length) {
    parsedStyles.value[index].selector = newName
  }
  
  // 重新生成CSS内容
  regenerateCSSContent()
}

// 添加新属性到样式规则
const addNewProperty = (ruleIndex) => {
  if (ruleIndex >= 0 && ruleIndex < parsedStyles.value.length) {
    // 获取用户选择的属性
    const selectedProperty = newPropertySelection.value[ruleIndex]
    
    // 如果没有选择属性，使用默认属性
    if (!selectedProperty) {
      parsedStyles.value[ruleIndex].properties.push({
        name: 'background-color',
        value: '#ffffff'
      })
    } else {
      // 添加用户选择的属性
      parsedStyles.value[ruleIndex].properties.push({
        name: selectedProperty,
        value: getPropertyDefaultValue(selectedProperty)
      })
      
      // 清除选择
      newPropertySelection.value[ruleIndex] = ''
    }
    
    // 重新生成CSS内容
    regenerateCSSContent()
  }
}

// 删除样式属性
const deleteProperty = (ruleIndex, propIndex) => {
  if (ruleIndex >= 0 && ruleIndex < parsedStyles.value.length) {
    // 从指定样式规则中删除指定属性
    parsedStyles.value[ruleIndex].properties.splice(propIndex, 1)
    
    // 重新生成CSS内容
    regenerateCSSContent()
  }
}

// 重新生成CSS内容
const regenerateCSSContent = () => {
  let cssContent = ''
  parsedStyles.value.forEach(rule => {
    cssContent += `${rule.selector} {\n`
    rule.properties.forEach(prop => {
      cssContent += `  ${prop.name}: ${prop.value};\n`
    })
    cssContent += '}\n\n'
  })
  
  // 更新本地样式
  if (localStyles.value.length > 0) {
    localStyles.value[0].content = cssContent
    emit('style-change', localStyles.value)
  } else {
    // 如果没有现有样式，创建新的样式对象
    const newStyle = {
      content: cssContent,
      scoped: true
    }
    localStyles.value = [newStyle]
    emit('style-change', localStyles.value)
  }
}

// 添加新样式规则
const addNewStyleRule = () => {
  parsedStyles.value.push({
    selector: '.new-class',
    properties: [
      { name: 'color', value: '#000000' },
      { name: 'font-size', value: '14px' }
    ]
  })
  
  // 重新生成CSS内容
  regenerateCSSContent()
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
  
  // 更新本地样式
  localStyles.value = [...styles]
  
  // 解析CSS为属性配置
  if (styles.length > 0) {
    const parsed = parseCSSStyles(styles[0].content)
    parsedStyles.value = parsed
  } else {
    parsedStyles.value = []
  }
  
  // 重置新属性选择
  newPropertySelection.value = {}
  
  emit('style-change', localStyles.value)
}

// 监听组件样式变化
watch(() => props.componentStyles, (newStyles) => {
  localStyles.value = [...newStyles]
  
  // 解析CSS为属性配置
  if (newStyles.length > 0) {
    const parsed = parseCSSStyles(newStyles[0].content)
    parsedStyles.value = parsed
  } else {
    parsedStyles.value = []
  }
}, { immediate: true, deep: true })

// 判断是否为颜色属性
const isColorProperty = (propertyName) => {
  const colorProperties = [
    'background-color',
    'color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color',
    'text-shadow',
    'box-shadow'
  ]
  return colorProperties.includes(propertyName)
}

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
  background-color: var(--bg-primary);
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-header h3::before {
  content: '⚙️';
  font-size: 1rem;
}

.panel-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  min-height: 0;
}

.props-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.props-panel.full-height {
  flex: 1;
}

.style-panel {
  border-top: 1px solid var(--border-color);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.style-panel.full-height {
  flex: 1;
}

.style-panel .panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.style-section {
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background-color: var(--bg-secondary);
}

.style-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.style-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.style-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0 0.5rem;
}

.prop-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.no-props, .no-styles {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-tertiary);
}

.style-rule-section {
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background-color: var(--bg-secondary);
  transition: all var(--transition-fast);
}

.style-rule-section:hover {
  box-shadow: var(--shadow-sm);
  border-color: var(--primary-color);
}

.style-rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.style-rule-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.style-properties {
  padding: 0.5rem 0;
}

.property-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.property-input-row .el-input {
  flex: 1;
}

.delete-property-btn {
  flex-shrink: 0;
  background-color: var(--error-color);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  transition: all var(--transition-fast);
}

.delete-property-btn:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}

.add-property-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.add-property-section .el-select {
  width: 100%;
  margin-bottom: 0.5rem;
}

:deep(.el-form-item__label) {
  white-space: normal;
  word-break: break-all;
  line-height: 1.3;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-primary);
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
  padding: 1px 7px;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

:deep(.el-button) {
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-fast);
}

:deep(.el-button--primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.el-button--primary:hover) {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

:deep(.el-button--danger) {
  background-color: var(--error-color);
  border-color: var(--error-color);
}

:deep(.el-button--danger:hover) {
  background-color: #dc2626;
  border-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

:deep(.el-button--small) {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

:deep(.el-button--text) {
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
}

:deep(.el-button--text:hover) {
  color: var(--primary-color);
  background-color: var(--bg-secondary);
}

:deep(.el-icon) {
  font-size: 1rem;
}

/* Element Plus 下拉菜单样式修复 */
:deep(.el-select-dropdown) {
  background-color: var(--bg-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-lg) !important;
}

:deep(.el-select-dropdown__item) {
  color: var(--text-primary) !important;
  font-size: 0.875rem !important;
  padding: 0.5rem 1rem !important;
  margin: 0 !important;
  border-radius: 0 !important;
  transition: all var(--transition-fast) !important;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: var(--bg-secondary) !important;
  color: var(--primary-color) !important;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: var(--primary-color) !important;
  color: white !important;
}

:deep(.el-color-picker) {
  --el-color-picker-border-radius: var(--radius-md);
}

:deep(.el-color-picker__panel) {
  background-color: var(--bg-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-lg) !important;
}

:deep(.el-color-picker__trigger) {
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-md) !important;
  transition: all var(--transition-fast) !important;
}

:deep(.el-color-picker__trigger:hover) {
  border-color: var(--primary-color) !important;
}

:deep(.el-empty) {
  padding: 2rem !important;
}

:deep(.el-empty__description) {
  color: var(--text-tertiary) !important;
  font-size: 0.875rem !important;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

/* 折叠按钮样式 */
.collapse-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.collapse-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--primary-color);
}

.collapse-btn .el-icon {
  font-size: 0.875rem;
  transition: transform var(--transition-fast);
}

.collapse-btn:hover .el-icon {
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .panel-header {
    padding: 0.75rem;
  }
  
  .panel-header h3 {
    font-size: 0.75rem;
  }
  
  .panel-content {
    padding: 0.75rem;
  }
  
  .style-rule-section,
  .style-section {
    padding: 0.75rem;
  }
  
  .property-input-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .property-input-row .el-input {
    width: 100%;
  }
  
  .delete-property-btn {
    align-self: flex-end;
  }
}
</style>
