import { getBuiltinTemplates } from '../utils/vueParser'

// Get the basic component template from built-in templates
const templates = getBuiltinTemplates()
export const defaultCode = templates.find(t => t.name === '基础组件').code
