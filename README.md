# 思源笔记 API 文档项目

本项目是思源笔记的API文档，使用纯HTML+CSS+JavaScript实现，无需后端支持，可以直接在浏览器中打开查看。

## 项目结构

- `index.html`: 主页，包含所有API分类的导航
- `pages/`: 存放各API分类的页面
- `styles.css`: 全局样式
- `api-tester.js`: API测试工具
- `api-template.html`: API文档页面模板
- 各API目录: system、notebook、block、filetree等，按功能分类存放各API文档

## 当前进度

- [x] 创建基本项目架构
- [x] 完成首页和导航结构
- [x] 完成所有API分组页面创建
- [ ] 完成各API具体文档页面
  - [x] 部分system API文档
  - [x] 部分notebook API文档
  - [x] 部分block API文档
  - [ ] 其他API文档
- [ ] 完善交互测试功能
- [ ] 优化样式和用户体验

## 如何贡献

1. 使用`api-template.html`作为基础模板创建新API文档页面
2. 放置到对应的目录中
3. 在对应分组页面中添加链接
4. 确保页面内容完整准确

## 如何使用

1. 直接用浏览器打开index.html
2. 通过导航找到需要的API
3. 在线测试功能需要配合思源笔记实例使用
   - 需要开启思源笔记
   - 在思源中获取API Token并正确配置

## 近期计划

优先完成以下核心API文档：

1. 历史记录API (history目录)
2. 搜索API (search目录)
3. 引用API (ref目录)
4. 大纲API (outline目录)
5. 书签API (bookmark目录)
6. 标签API (tag目录)
7. 存储API (storage目录)
8. 账户API (account目录)

## 许可证

与思源笔记相同，本项目采用AGPLv3许可证 