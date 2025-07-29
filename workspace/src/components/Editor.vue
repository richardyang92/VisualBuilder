<template>
  <div class="editor-container">
    <div class="editor-header">
      <h3>代码编辑器</h3>
      <div class="editor-controls">
        <el-button size="small" @click="toggleTheme" style="margin-right: 8px">
          {{ isDarkTheme ? '☀️' : '🌙' }}
        </el-button>
        <el-button size="small" @click="formatCode">格式化</el-button>
      </div>
    </div>
    <div class="editor-content" ref="editorContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as monaco from 'monaco-editor'

// 不需要特殊的web worker配置

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'vue'
  }
})
const emit = defineEmits(['update:modelValue', 'code-change'])

const editorContainer = ref(null)
let editor = null
const isDarkTheme = ref(true)

onMounted(() => {
  // 使用内置主题
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: 'vue',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    tabSize: 2,
    insertSpaces: true,
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showClasses: true,
      showFunctions: true,
      showVariables: true
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    parameterHints: { enabled: true },
    hover: { enabled: true },
    folding: true,
    foldingStrategy: 'indentation'
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    const value = editor.getValue()
    emit('update:modelValue', value)
    emit('code-change', value)
  })
})

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  const theme = isDarkTheme.value ? 'vs-dark' : 'vs-light'
  if (editor) {
    monaco.editor.setTheme(theme)
  }
}

// 格式化代码
const formatCode = () => {
  if (editor) {
    // 使用 Monaco Editor 的格式化功能
    editor.getAction('editor.action.formatDocument').run()
  }
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})
</script>

<style scoped>
.editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #dcdfe6;
}

.editor-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.editor-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-content {
  flex: 1;
  overflow: hidden;
}
</style>
