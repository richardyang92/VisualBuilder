import { compileScript, parse } from '@vue/compiler-sfc'

/**
 * 解析Vue组件代码，提取props定义和样式
 * @param {string} code - Vue组件代码
 * @returns {object} 解析结果
 */
export function parseVueComponent(code) {
  try {
    const props = []
    const styles = []
    
    // 使用正则直接提取所有prop定义
    const propRegex = /(\w+)\s*:\s*{[^}]*default\s*:\s*['"`]([^'"`]+)['"`]/g
    let match
    
    while ((match = propRegex.exec(code)) !== null) {
      props.push({
        name: match[1],
        type: 'string',
        default: match[2]
      })
    }
    
    // 如果没有找到带默认值的prop，查找所有prop
    if (props.length === 0) {
      const allPropRegex = /(\w+)\s*:\s*(?:{[^}]*}|String|Number|Boolean)/g
      while ((match = allPropRegex.exec(code)) !== null) {
        // 检查是否已经添加过
        if (!props.find(p => p.name === match[1])) {
          // 查找这个prop的默认值
          const defaultRegex = new RegExp(`${match[1]}\\s*:\\s*{[^}]*default\\s*:\\s*['"\`]([^'"}\`]+)['"\`]`)
          const defaultMatch = code.match(defaultRegex)
          
          props.push({
            name: match[1],
            type: 'string',
            default: defaultMatch ? defaultMatch[1] : ''
          })
        }
      }
    }
    
    // 提取样式内容
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g
    let styleMatch
    while ((styleMatch = styleRegex.exec(code)) !== null) {
      styles.push({
        content: styleMatch[1].trim(),
        scoped: styleMatch[0].includes('scoped')
      })
    }
    
    console.log('解析到的props:', props)
    console.log('解析到的样式:', styles)
    return {
      props,
      template: '',
      script: '',
      styles
    }
  } catch (error) {
    console.error('解析Vue组件失败:', error)
    return { props: [], template: '', script: [], styles: [] }
  }
}

/**
 * 根据新的props值生成更新后的Vue组件代码
 * @param {string} originalCode - 原始代码
 * @param {object} newProps - 新的props值
 * @returns {string} 更新后的代码
 */
export function generateVueComponent(originalCode, newProps) {
  // 这个函数现在不再需要，因为不需要反向更新代码
  return originalCode
}

/**
 * 根据新的样式更新Vue组件代码
 * @param {string} originalCode - 原始代码
 * @param {Array} newStyles - 新的样式数组
 * @returns {string} 更新后的代码
 */
export function updateVueComponentStyles(originalCode, newStyles) {
  // 如果没有样式，直接返回原始代码
  if (!newStyles || newStyles.length === 0) {
    return originalCode
  }
  
  // 生成新的样式内容
  let newStyleContent = ''
  newStyles.forEach(style => {
    const scopedAttr = style.scoped ? ' scoped' : ''
    newStyleContent += `<style${scopedAttr}>\n${style.content}\n</style>\n`
  })
  
  // 检查原始代码中是否有<style>标签
  const styleRegex = /<style[^>]*>[\s\S]*?<\/style>\s*/g
  const hasStyleTag = styleRegex.test(originalCode)
  
  if (hasStyleTag) {
    // 如果有<style>标签，替换它
    return originalCode.replace(styleRegex, newStyleContent)
  } else {
    // 如果没有<style>标签，将新样式添加到代码末尾
    // 但要在</script>标签之后
    const scriptRegex = /<\/script>\s*/
    if (scriptRegex.test(originalCode)) {
      return originalCode.replace(scriptRegex, `</script>\n\n${newStyleContent}`)
    } else {
      // 如果连</script>标签都没有，直接添加到末尾
      return originalCode + `\n\n${newStyleContent}`
    }
  }
}

/**
 * 更新Vue组件代码中的props默认值
 * @param {string} originalCode - 原始代码
 * @param {string} propName - 属性名称
 * @param {string} newDefaultValue - 新的默认值
 * @returns {string} 更新后的代码
 */
export function updateVueComponentPropDefault(originalCode, propName, newDefaultValue) {
  // 创建一个正则表达式来匹配指定prop的定义
  // 匹配类似: propName: { ... default: 'value' ... }
  const propRegex = new RegExp(`(${propName}\\s*:\\s*\\{[^}]*default\\s*:\\s*)['"\`][^'"\`]*['"\`]`, 'g');
  
  // 替换默认值
  const updatedCode = originalCode.replace(propRegex, `$1'${newDefaultValue}'`);
  
  return updatedCode;
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 创建组件模板
 * @param {string} name - 模板名称
 * @param {string} description - 模板描述
 * @param {string} code - 模板代码
 * @returns {object} 模板对象
 */
export function createTemplate(name, description, code) {
  return {
    id: generateUUID(),
    name,
    description,
    code,
    preview: null
  }
}

/**
 * 获取内置模板列表
 * @returns {Array} 模板列表
 */
export async function getBuiltinTemplates() {
  // 动态导入所有模板文件
  const [basicComponent, cardComponent, formComponent] = await Promise.all([
    import('../templates/basic-component.json'),
    import('../templates/card-component.json'),
    import('../templates/form-component.json')
  ])

  return [
    createTemplate(
      basicComponent.default.name,
      basicComponent.default.description,
      basicComponent.default.code
    ),
    createTemplate(
      cardComponent.default.name,
      cardComponent.default.description,
      cardComponent.default.code
    ),
    createTemplate(
      formComponent.default.name,
      formComponent.default.description,
      formComponent.default.code
    )
  ]
}

/**
 * 加载指定的模板文件
 * @param {string} fileName - 模板文件名
 * @returns {object} 模板对象
 */
export async function loadTemplate(fileName) {
  try {
    // 确保文件名以.json结尾
    const fullFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    
    // 使用fetch API加载模板文件
    const response = await fetch(`/src/templates/${fullFileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load template ${fullFileName}: ${response.status} ${response.statusText}`);
    }
    
    const templateData = await response.json();
    
    return createTemplate(
      templateData.name,
      templateData.description,
      templateData.code
    )
  } catch (error) {
    console.error(`Failed to load template ${fileName}:`, error)
    throw error
  }
}

/**
 * 获取默认代码模板
 * @returns {string} 默认代码
 */
export async function getDefaultCode() {
  try {
    // Load all template files from the templates directory
    const templateFiles = [
      'basic-component.json',
      'card-component.json',
      'form-component.json'
    ];
    
    // Load and parse all templates
    const templates = await Promise.all(
      templateFiles.map(async (fileName) => {
        try {
          const template = await loadTemplate(fileName);
          return template;
        } catch (error) {
          console.error(`Failed to load template ${fileName}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any null templates and find the "基础组件" template
    const validTemplates = templates.filter(template => template !== null);
    const basicComponent = validTemplates.find(t => t.name === '基础组件');
    
    return basicComponent ? basicComponent.code : '';
  } catch (error) {
    console.error('Failed to load default template:', error);
    return '';
  }
}
