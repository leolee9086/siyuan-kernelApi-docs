# 这个区段由开发者编写,未经允许禁止AI修改

# 修改记录

## 2024-XX-XX (织)
*   **修改**: 更新了根目录的 `README.md` 文件。
    *   添加了项目为“非官方”、“AI 辅助编写”、“准确性不保证”的声明。
    *   添加了赞助链接。
    *   更新了项目结构、当前进度、贡献方式和使用说明，以反映最新状态和在线测试功能。
    *   调整了近期计划。

<思源笔记API文档生成项目>
你可以从后端go代码中找到这些后端api的实现代码

## 开发说明

这个API文档项目使用纯HTML+CSS+JavaScript实现，无需后端支持，可以直接在浏览器中打开查看。文档提供了以下功能：

1. 所有API的分类和清晰的导航结构
2. 详细的参数说明和返回值文档
3. 请求和响应示例
4. 交互式在线测试功能（需要思源笔记实例运行）

## 目录结构规范

- 根据API分类创建子目录，如system、notebook、export等
- 每个API独立一个HTML文件，文件名与API端点一致
- 公共资源（CSS/JS/图片）放在根目录下
- 确保所有文件使用UTF-8编码

## 文档编写规范

1. 每个API文档页面应包含：
   - 基本信息（名称、路径、HTTP方法）
   - 详细描述
   - 参数表格（参数名、类型、是否必须、描述）
   - 返回值表格
   - 请求示例
   - 响应示例
   - 在线测试表单

2. 所有示例代码应格式化为易读形式

3. 连接应正确链接到相关API文档

## 扩展指南

添加新API文档时：
1. 复制api-template.html作为基础模板
2. 修改相关内容

# 开发进度追踪

## 已完成的工作

1. 创建了API文档项目的基本架构
2. 完成了首页API分类列表的完善（根据后端router.go添加了所有API分类）
3. 实现了部分文档页面：
   - system目录: bootProgress.html, version.html, currentTime.html
   - notebook目录: lsNotebooks.html, renameNotebook.html
   - block目录：getBlockInfo.html, insertBlock.html, prependBlock.html, appendBlock.html, updateBlock.html, deleteBlock.html, moveBlock.html, foldBlock.html, unfoldBlock.html, getBlockKramdown.html, getChildBlocks.html, transferBlockRef.html
4. 优化了首页结构，将API列表按分组拆分为单独页面
   - 创建了pages目录存放分组页面
   - 完成了所有API分组页面：
     - system.html（系统API）
     - notebook.html（笔记本API）
     - block.html（块API）
     - filetree.html（文档API）
     - attr.html（属性API）
     - query.html（SQL查询API）
     - template.html（模板API）
     - file.html（文件API）
     - export.html（导出API）
     - history.html（历史记录API）
     - search.html（搜索API）
     - ref.html（引用API）
     - outline.html（大纲API）
     - bookmark.html（书签API）
     - tag.html（标签API）
     - storage.html（存储API）
     - account.html（账户API）
     - lute.html（文本处理API）
     - format.html（格式化API）
     - cloud.html（云服务API）
     - sync.html（同步API）
     - inbox.html（收集箱API）
   - 更新了样式表以支持新的页面结构

## 待完成工作

1. 完成剩余API的文档页面创建

   以下是下一步需要优先创建的API文档页面：
   
   - 在history目录下创建：
     - getNotebookHistory.html
     - rollbackNotebookHistory.html
     - getDocHistoryContent.html
     - rollbackDocHistory.html
     - clearWorkspaceHistory.html
   
   - 在search目录下创建：
     - searchTag.html
     - searchTemplate.html
     - fullTextSearchBlock.html
     - findReplace.html
   
   - 在ref目录下创建：
     - getBacklink.html
     - getBacklinkDoc.html
   
   - 在outline目录下创建：
     - getDocOutline.html
   
   - 在bookmark目录下创建：
     - getBookmark.html
     - renameBookmark.html
     - removeBookmark.html
   
   - 在tag目录下创建：
     - getTag.html
     - renameTag.html
     - removeTag.html
   
   - 在storage目录下创建：
     - getLocalStorage.html
     - setLocalStorage.html
   
   - 在account目录下创建：
     - login.html
   
   完成以上优先API文档后，继续完成其他API文档。

2. 优化文档样式和交互体验

3. 测试确认所有API测试功能正常工作

## 测试记录

- 已测试API:
  - /api/system/version
  - /api/notebook/lsNotebooks

## 贡献指南

如需添加新API文档或改进现有文档，请遵循以下步骤：

1. 使用api-template.html作为基础模板创建新API文档页面
2. 在对应分组页面中添加API链接
3. 确保API文档内容完整且准确
4. 更新AInote.md中的开发进度信息
 