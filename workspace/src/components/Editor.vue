<template>
  <div class="editor-container">
    <div class="editor-header">
      <h3>代码编辑器</h3>
      <div class="editor-controls">
        <el-button size="small" @click="formatCode">格式化</el-button>
      </div>
    </div>
    <div class="editor-content" ref="editorContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, getCurrentInstance } from 'vue'
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
  },
  isDarkTheme: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue', 'code-change'])

const editorContainer = ref(null)
let editor = null

// 获取父组件实例
const appInstance = getCurrentInstance()

// 监听传入的主题属性变化
watch(() => props.isDarkTheme, (newTheme) => {
  const theme = newTheme ? 'vs-dark' : 'vs-light'
  if (editor) {
    monaco.editor.setTheme(theme)
    // 同时更新编辑器容器的背景色
    const editorElement = editorContainer.value
    if (editorElement) {
      if (newTheme) {
        editorElement.style.backgroundColor = '#1e1e1e'
      } else {
        editorElement.style.backgroundColor = '#ffffff'
      }
    }
  }
}, { immediate: true })

onMounted(() => {
  // 使用内置主题
  const initialTheme = props.isDarkTheme ? 'vs-dark' : 'vs-light'
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: 'vue',
    theme: initialTheme,
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
  background-color: var(--bg-primary);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  flex-shrink: 0;
}

.editor-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.editor-header h3::before {
  content: '💻';
  font-size: 1rem;
}

.editor-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.editor-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: var(--bg-primary);
  transition: background-color var(--transition-normal);
}

/* Monaco Editor 自定义样式 */
:deep(.monaco-editor) {
  height: 100%;
  font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 动态设置编辑器背景色 */
:deep(.monaco-editor .margin-view-overlays),
:deep(.monaco-editor .lines-content),
:deep(.monaco-editor .monaco-editor-background),
:deep(.monaco-editor .inputarea) {
  background-color: var(--bg-primary) !important;
}

:deep(.monaco-editor .view-line) {
  font-size: 14px;
  line-height: 1.6;
}

:deep(.monaco-editor .view-line span) {
  font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

:deep(.monaco-editor .cursors-layer .cursor) {
  background-color: #ffffff;
}

:deep(.monaco-editor .selected-text) {
  background-color: #264f78;
}

:deep(.monaco-editor .bracket-match) {
  background-color: #264f78;
}

/* 暗色主题 */
:deep(.monaco-editor.vs-dark) {
  color: #d4d4d4;
}

:deep(.monaco-editor.vs-dark .view-line) {
  color: #d4d4d4;
}

:deep(.monaco-editor.vs-dark .view-line span) {
  color: #d4d4d4;
}

:deep(.monaco-editor.vs-dark .line-numbers) {
  color: #858585;
}

:deep(.monaco-editor.vs-dark .line-numbers:hover) {
  color: #d4d4d4;
}

/* 亮色主题 */
:deep(.monaco-editor.vs-light) {
  color: #333333;
}

:deep(.monaco-editor.vs-light .view-line) {
  color: #333333;
}

:deep(.monaco-editor.vs-light .view-line span) {
  color: #333333;
}

:deep(.monaco-editor.vs-light .line-numbers) {
  color: #858585;
}

:deep(.monaco-editor.vs-light .line-numbers:hover) {
  color: #333333;
}

/* 自定义滚动条 */
:deep(.monaco-editor .scrollbar) {
  background: #1e1e1e;
}

:deep(.monaco-editor .scrollbar .slider) {
  background: #424242;
}

:deep(.monaco-editor .scrollbar .slider:hover) {
  background: #616161;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-header {
    padding: 0.75rem;
  }
  
  .editor-header h3 {
    font-size: 0.75rem;
  }
  
  .editor-controls {
    gap: 0.25rem;
  }
  
  :deep(.monaco-editor .view-line) {
    font-size: 12px;
  }
}
</style>
