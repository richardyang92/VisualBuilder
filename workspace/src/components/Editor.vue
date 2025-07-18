<template>
  <div class="editor-container">
    <div class="editor-header">
      <h3>代码编辑器</h3>
      <div class="editor-controls">
        <el-select 
          v-model="currentLanguage" 
          size="small" 
          style="width: 100px; margin-right: 8px"
          @change="changeLanguage"
        >
          <el-option label="Vue" value="vue" />
          <el-option label="JavaScript" value="javascript" />
          <el-option label="TypeScript" value="typescript" />
          <el-option label="HTML" value="html" />
          <el-option label="CSS" value="css" />
          <el-option label="JSON" value="json" />
        </el-select>
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

// 完全禁用 Monaco Editor 的 web worker 功能
window.MonacoEnvironment = {
  getWorker: function() {
    return null
  },
  getWorkerUrl: function() {
    return null
  }
}

// 全局禁用 Monaco Editor 的 worker 相关功能
if (typeof window !== 'undefined') {
  window.MonacoEnvironment = window.MonacoEnvironment || {}
  window.MonacoEnvironment.getWorker = function() {
    return null
  }
  window.MonacoEnvironment.getWorkerUrl = function() {
    return null
  }
}

// 禁用 Monaco Editor 的链接功能以避免 worker 错误
if (typeof window !== 'undefined') {
  window.MonacoEnvironment = {
    getWorker: function() {
      return null
    },
    getWorkerUrl: function() {
      return null
    }
  }
}

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
const currentLanguage = ref(props.language)
const isDarkTheme = ref(true)

onMounted(() => {
  // 使用内置主题
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language,
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

// 切换语言
const changeLanguage = (language) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, language)
    }
  }
}

// 格式化代码
const formatCode = () => {
  if (editor) {
    editor.getAction('editor.action.formatDocument').run()
  }
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

// 监听语言变化
watch(() => props.language, (newLanguage) => {
  currentLanguage.value = newLanguage
  if (editor) {
    changeLanguage(newLanguage)
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
