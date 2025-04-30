# 这个区段由开发者编写,未经允许禁止AI修改
<文档API文档生成>

## 文档API说明

文档API（filetree模块）是思源笔记中用于管理文档的核心API集合，包括创建、获取、更新、删除文档等操作。
这些API在文档树结构管理中起着核心作用，能够实现以下功能：

1. 获取文档内容和结构
2. 创建新文档（普通文档或Markdown导入）
3. 重命名文档
4. 删除文档
5. 移动文档
6. 复制文档
7. 管理文档属性

## 已完成API文档

- getDoc.html：获取文档内容
- createDocWithMd.html：通过Markdown创建文档
- renameDoc.html：重命名文档
- removeDoc.html：删除文档
- moveDoc.html：移动文档
- duplicateDoc.html：复制文档
- getDocCreateSavePath.html：获取文档创建保存路径
- setDocAttrs.html：设置文档属性

## 待完成API文档

- getDocCreateSavePath.html：获取文档创建保存路径
- setDocAttrs.html：设置文档属性

## 文档编写注意事项

1. 确保每个API文档包含完整的参数和返回值说明
2. 提供有效的请求和响应示例
3. 对于危险操作（如删除），添加明显的警告提示
4. 在在线测试区域提供合理的默认参数值

## 文档API的重要性

文档API是思源笔记核心功能的基础，为用户提供了通过编程方式管理知识库文档的能力。
这些API可用于构建自动化工具、第三方集成和扩展功能。 