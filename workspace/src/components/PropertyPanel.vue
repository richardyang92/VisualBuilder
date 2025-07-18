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
  }
})

const emit = defineEmits(['props-change'])

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
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #dcdfe6;
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

.prop-description {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.no-props {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}
</style>
