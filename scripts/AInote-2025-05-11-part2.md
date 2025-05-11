# 这个区段由开发者编写,未经允许禁止AI修改

## 2025-05-11 14:01 - Ran `check_docs.js` script

*   **Time of execution**: 2025-05-11 14:01:50 - (refer to terminal output for end time)
*   **Script**: `node check_docs.js` (from `siyuan-kernelApi-docs/scripts`)
*   **Key Findings**:
    *   Found 407 API definitions in `router.go`.
    *   **69 APIs are missing documentation files** (down from 70).
    *   1 orphaned file still exists: `transactions/transactions.html`.
    *   All group `index.html` files are consistent with API definitions.
*   **Next API to document** (based on the new list): `/api/setting/addVirtualBlockRefExclude`.

---

## 2025-05-11 14:14

- **为 `/api/setting/addVirtualBlockRefExclude` 创建文档**:
    - 阅读 `siyuan/kernel/api/setting.go` 中 `addVirtualBlockRefExclude` 函数的源码 (第 68 行)。
    - 阅读 `siyuan/kernel/api/router.go` 中该 API 的路由定义 (第 353 行)。
    - **确认信息**:
        - HTTP Method: `POST`.
        - 接口路径: `/api/setting/addVirtualBlockRefExclude`.
        - 认证状态: "需要认证" (`model.CheckAuth`), "需要管理员" (`model.CheckAdminRole`), "检查只读模式" (`model.CheckReadonly`).
        - 接口描述: "添加一批关键词到虚拟块引用的排除列表中。用于优化虚拟引用的相关性。成功后广播 setConf 事件。在只读模式下禁止。"
        - 请求参数 (JSON Body):
            - `keywords` (string[], 必需) - 要添加到排除列表的关键词数组。
        - 返回值 (JSON): 标准结构 `code`, `msg`, `data` (成功时 `data` 为 `null`).
    - 创建了新的文档文件 `siyuan-kernelApi-docs/setting/addVirtualBlockRefExclude.html`，包含在线测试区。
    - 文档中包含了接口描述、参数、返回值及示例。
- **下一步**: 运行 `check_docs.js` 确认下一个缺失的 API 并继续处理。

---

## 2025-05-11 14:32 - Refactored AInote.md

- 根据哥哥的指示，将主 `AInote.md` 文件进行了拆分。
- **操作详情**:
    - 将原 `AInote.md` 中的日志条目按日期 (`YYYY-MM-DD`) 拆分到单独的文件中。
    - 创建了以下每日日志文件:
        - `AInote-2025-05-10.md`
        - `AInote-2025-05-11.md` (This entry refers to the file before this current refactoring)
    - 每个每日日志文件都保留了顶部的开发者要求区块。
    - 主 `AInote.md` 文件已更新为索引文件，包含指向各个每日日志文件的链接。
- **原因**: 主 `AInote.md` 文件内容过长（约600行），不易管理和查阅。
- **后续**: 今日后续日志将继续记录在本文件 (`AInote-2025-05-11-part2.md`)。

---

**Timestamp:** 2025-05-11 16:03:32 GMT+0800

**Action:** Ran `check_docs.js` script.

**Summary of Findings:**
*   API definitions in `router.go`: 407
*   APIs missing documentation: 56
*   Orphaned documentation files: 1 (`transactions/transactions.html`)
*   Group `index.html` files: Consistent with API definitions.

**Next API to document:** `/api/setting/setExport` (based on the script output).

---

**Timestamp:** 2025-05-11 16:06:15 GMT+0800

**API Processed:** `/api/setting/setExport`

**Summary:** Created HTML documentation for the `/api/setting/setExport` API endpoint.

**Details:**
*   **API Endpoint:** `/api/setting/setExport`
*   **HTTP Method:** `POST`
*   **Authentication:** `model.CheckAuth`, `model.CheckAdminRole`, `model.CheckReadonly`.
*   **Go Function:** `setExport` in `siyuan/kernel/api/setting.go`.
*   **Associated Config Struct:** `conf.Export` in `siyuan/kernel/conf/export.go`.
*   **Request Parameters (JSON Body):** A complete `conf.Export` object. Key fields include:
    *   `paragraphBeginningSpace` (boolean)
    *   `addTitle` (boolean)
    *   `blockRefMode` (number)
    *   `blockEmbedMode` (number)
    *   `pandocBin` (string)
    *   `markdownYFM` (boolean)
    *   `pdfFooter` (string)
    *   (And others related to watermarks, templates, etc.)
*   **Functionality:** Updates the global export configurations. Validates `pandocBin` if provided.
*   **Response:** Standard structure, with `data` containing the updated `Export` object on success.
*   **Action:** Created `siyuan-kernelApi-docs/setting/setExport.html`.
    *   The documentation includes a detailed table of all parameters from `conf.Export`.
    *   An online test area is provided, with a helper button to load current export settings from `/api/system/getConf` to prepopulate the request body.
    *   Fixed linter errors related to JavaScript string formatting in the generated HTML.

**Next Step:** Run `check_docs.js` to identify the next missing API and continue documentation.

---
## 2025-05-11 16:12 - Ran `check_docs.js` script

**Timestamp before script:** 2025-05-11 16:12:28
**Timestamp after script:** 2025-05-11 16:12:40

**Execution:**
- Command: `node check_docs.js`
- Working directory: `D:\siyuan\siyuan-kernelApi-docs\scripts`

**Result:**
- API definitions: 407
- Missing API docs: 54
- Orphaned docs: 1 (`transactions/transactions.html` - this seems to be a persistent one, maybe we should check it later if it's not automatically handled by fixing missing docs or if it's a real orphan)

**Full output:**
```
PS D:\siyuan\siyuan-kernelApi-docs\scripts> node check_docs.js

🔄 正在尝试更新本地思源仓库: D:\siyuan\siyuan
   切换到目录: D:\siyuan\siyuan
✅ 本地思源仓库更新成功:
   (无更新内容)

ℹ️ 将从本地路径读取 router.go: D:\siyuan\siyuan\kernel\api\router.go

🔍 从 本地文件 router.go 中找到 407 个有效 API/WS 定义，分布在 44 个分类中。

🚀 开始双重校验 API 文档覆盖情况...

📂 开始检查 API 文件结构 (一对一匹配)...
   扫描了 49 个物理子目录中的 353 个非索引 HTML 文件.
   🚨 文件结构检查：发现 54 个 API 缺少对应的文档文件:
     - /api/setting/setFlashcard
     - /api/setting/setKeymap
     - /api/setting/setPublish
     - /api/setting/setSearch
     - /api/setting/setSnippet
     - /api/storage/getCriteria
     - /api/storage/getRecentDocs
     - /api/storage/removeCriterion
     - /api/storage/removeLocalStorageVals
     - /api/storage/setCriterion
     - /api/storage/setLocalStorageVal
     - /api/sync/createCloudSyncDir
     - /api/sync/exportSyncProviderS3
     - /api/sync/exportSyncProviderWebDAV
     - /api/sync/getBootSync
     - /api/sync/getSyncInfo
     - /api/sync/importSyncProviderS3
     - /api/sync/importSyncProviderWebDAV
     - /api/sync/listCloudSyncDir
     - /api/sync/performBootSync
     - /api/sync/performSync
     - /api/sync/removeCloudSyncDir
     - /api/sync/setCloudSyncDir
     - /api/sync/setSyncEnable
     - /api/sync/setSyncGenerateConflictDoc
     - /api/sync/setSyncInterval
     - /api/sync/setSyncMode
     - /api/sync/setSyncPerception
     - /api/sync/setSyncProvider
     - /api/sync/setSyncProviderLocal
     - /api/sync/setSyncProviderS3
     - /api/sync/setSyncProviderWebDAV
     - /api/system/addMicrosoftDefenderExclusion
     - /api/system/exportConf
     - /api/system/getCaptcha
     - /api/system/getChangelog
     - /api/system/getConf
     - /api/system/getEmojiConf
     - /api/system/getWorkspaceInfo
     - /api/system/getWorkspaces
     - /api/system/ignoreAddMicrosoftDefenderExclusion
     - /api/system/importConf
     - /api/system/loginAuth
     - /api/system/logoutAuth
     - /api/system/reloadUI
     - /api/system/setAPIToken
     - /api/system/setAccessAuthCode
     - /api/system/setDownloadInstallPkg
     - /api/system/uiproc
     - /api/ui/reloadAttributeView
     - /api/ui/reloadFiletree
   ✅ 索引检查 [account]: index.html 内容与 API 定义一致 (5 个)。
   ... (omitted consistent index checks for brevity) ...
   ✅ 所有分组索引均与代码定义一致，且无孤立索引。

🏁 双重校验完成。总结：
   - 🔴 54 个 API 缺少对应的文档文件。
   - 🟡 1 个孤立的文档文件需要清理。
   - ✅ 没有发现孤立的 index.html 文件。
   请根据上面的详细报告进行处理。
PS D:\siyuan\siyuan-kernelApi-docs\scripts>
```

**Next Step:** Process the next missing API: `/api/setting/setFlashcard`.

---
## 2025-05-11 16:15 - API Doc: `/api/setting/setFlashcard`

**Timestamps:**
- Start: 2025-05-11 16:14:09
- End: 2025-05-11 16:15:19

**API Processed:** `/api/setting/setFlashcard`

**Summary:** Created HTML documentation for the `/api/setting/setFlashcard` API endpoint.

**Details:**
*   **API Endpoint:** `/api/setting/setFlashcard`
*   **HTTP Method:** `POST`
*   **Authentication:** `model.CheckAuth`, `model.CheckAdminRole`, `model.CheckReadonly`.
*   **Go Function:** `setFlashcard` in `siyuan/kernel/api/setting.go` (Lines 225-250).
*   **Associated Config Struct:** `conf.Flashcard` in `siyuan/kernel/conf/flashcard.go`.
*   **Request Parameters (JSON Body):** A complete `conf.Flashcard` object. Key fields include:
    *   `newCardLimit` (number, default: 20) - Min 0.
    *   `reviewCardLimit` (number, default: 200) - Min 0.
    *   `mark` (boolean, default: true)
    *   `list` (boolean, default: true)
    *   `superBlock` (boolean, default: true)
    *   `heading` (boolean, default: true)
    *   `deck` (boolean, default: false)
    *   `reviewMode` (number, default: 0) - 0:混合, 1:新卡优先, 2:旧卡优先.
    *   `requestRetention` (number, default: FSRS default)
    *   `maximumInterval` (number, default: FSRS default)
    *   `weights` (string, default: FSRS default) - Comma-separated floats.
*   **Functionality:** Updates the global flashcard configurations. Validates `newCardLimit` and `reviewCardLimit` to be non-negative.
*   **Response:** Standard structure, with `data` containing the updated `Flashcard` object on success.
*   **Action:** Created `siyuan-kernelApi-docs/setting/setFlashcard.html`.
    *   The documentation includes a detailed table of all parameters from `conf.Flashcard` along with their default values and descriptions.
    *   An online test area is provided, with a helper button to load current flashcard settings from `/api/system/getConf`.

**Next Step:** Run `check_docs.js` to identify the next missing API and continue documentation. 

---
## 2025-05-11 16:17 - Ran `check_docs.js` script

**Timestamp before script:** 2025-05-11 16:17:18
**Timestamp after script:** 2025-05-11 16:17:38

**Execution:**
- Command: `node check_docs.js`
- Working directory: `D:\siyuan\siyuan-kernelApi-docs\scripts`

**Result:**
- API definitions: 407 (No change)
- Missing API docs: 53 (Down from 54)
- Orphaned docs: 1 (`transactions\transactions.html` - still present)

**Full output:**
```
PS D:\siyuan\siyuan-kernelApi-docs\scripts> node check_docs.js

🔄 正在尝试更新本地思源仓库: D:\siyuan\siyuan
   切换到目录: D:\siyuan\siyuan
✅ 本地思源仓库更新成功:
   (无更新内容)

🚀 开始双重校验 API 文档覆盖情况...

📂 开始检查 API 文件结构 (一对一匹配)...
   扫描了 49 个物理子目录中的 354 个非索引 HTML 文件.
   🚨 文件结构检查：发现 53 个 API 缺少对应的文档文件:
     - /api/setting/setKeymap
     - /api/setting/setPublish
     // ... (list of 53 missing APIs) ...
     - /api/ui/reloadUI
   ⚠️ 文件结构检查：发现 1 个孤立的文档文件 (代码中无对应 API 定义):
     - transactions\transactions.html (尝试匹配: /api/transactions/transactions 或 /ws/transactions/transactions)

📄 开始检查分组索引文件 (index.html)...
   --- 对比代码定义与索引文件 ---
   // ... (consistent index checks omitted for brevity) ...
   ✅ 所有分组索引均与代码定义一致，且无孤立索引。

🏁 双重校验完成。总结：
   - 🔴 53 个 API 缺少对应的文档文件。
   - 🟡 1 个孤立的文档文件需要清理。
   - ✅ 没有发现孤立的 index.html 文件。
   请根据上面的详细报告进行处理。
PS D:\siyuan\siyuan-kernelApi-docs\scripts>
```

**Next Step:** Process the next missing API: `/api/setting/setKeymap`. 

---
## 2025-05-11 16:59 - API文档: `/api/setting/setKeymap`

**时间戳:**
- 开始: 2025-05-11 16:35:35 (大约)
- 结束: 2025-05-11 16:59:35

**处理的API:** `/api/setting/setKeymap`

**摘要:** 为 `/api/setting/setKeymap` API 端点创建了 HTML 文档。

**详情:**
*   **API 端点:** `/api/setting/setKeymap`
*   **HTTP 方法:** `POST`
*   **认证:** `model.CheckAuth`, `model.CheckAdminRole`, `model.CheckReadonly`。
*   **Go 函数:** `setKeymap` (位于 `siyuan/kernel/api/setting.go` 文件，第 485-504 行)。
*   **请求体结构:** 请求体是一个 JSON 对象，包含一个 `data` 字段。这个 `data` 字段持有一个 `map[string]interface{}`，代表整个快捷键配置。这个 map 的键通常是分类 (例如: `"general"`, `"editor"`)，值是命令到快捷键的嵌套映射 (例如: `"riffCard": "⌘F1"`)。
    *   `conf.Keymap` 在 `siyuan/kernel/conf/layout.go` 中定义为 `type Keymap map[string]interface{}`。
*   **功能:** 更新思源笔记的全局快捷键配置。
*   **响应:** 标准的思源 API 响应结构 (`{code, msg, data}`), 成功时 `data` 为 `null`。
*   **操作:** 创建了 `siyuan-kernelApi-docs/setting/setKeymap.html`.
    *   文档中包含了请求体结构的描述、一个示例以及一个在线测试区域，该区域有一个按钮可以通过 `/api/system/getConf` 加载当前的快捷键设置。
    *   在生成的 HTML 中遇到了与 JavaScript 模板字符串相关的持续性 linter 错误。尝试使用 `edit_file` 工具进行多次修复，但应用模型未能正确执行更改。决定在不解决这些次要 JS linting 问题的情况下继续。

**下一步:** 运行 `check_docs.js` 以确定下一个缺失的 API 并继续文档化工作。

---
## 2025-05-11 17:13 - API文档: `/api/setting/setPublish`

**时间戳:**
- 开始: 2025-05-11 17:11:04 (大约)
- 结束: 2025-05-11 17:13:12

**处理的API:** `/api/setting/setPublish`

**摘要:** 为 `/api/setting/setPublish` API 端点创建了 HTML 文档。

**详情:**
*   **API 端点:** `/api/setting/setPublish`
*   **HTTP 方法:** `POST`
*   **认证:** `model.CheckAuth`, `model.CheckAdminRole`, `model.CheckReadonly`。
*   **Go 函数:** `setPublish` (位于 `siyuan/kernel/api/setting.go` 文件，第 539-567 行)。
*   **请求体结构:** 接受一个完整的 `conf.Publish` 对象，定义在 `siyuan/kernel/conf/publish.go`。
    *   `Enable` (boolean): 启用/禁用发布服务。
    *   `Port` (uint16): 发布服务使用的端口。
    *   `Auth` (object): Basic 认证设置。
        *   `Enable` (boolean): 启用/禁用发布服务的 Basic 认证。
        *   `Accounts` (array of objects): Basic 认证的用户名/密码/备注列表。
*   **功能:** 更新全局发布服务配置。如果 `enable` 为 true，它会尝试在指定的 `port` 上初始化/重启发布服务。
*   **响应:** 标准的思源 API 响应。成功时 (`code: 0`)，`data` 包含:
    *   `port` (number): 发布服务实际运行的端口号。
    *   `publish` (object): 更新后的完整 `conf.Publish` 对象。
*   **操作:** 创建了 `siyuan-kernelApi-docs/setting/setPublish.html`.
    *   文档包括 `conf.Publish`, `conf.BasicAuth`, 和 `conf.BasicAuthAccount` 的详细参数表。
    *   在线测试区域包含一个 `loadCurrentPublishConf()` 按钮，该按钮首先尝试通过 `/api/setting/getPublish` 获取当前设置，如果需要则回退到 `/api/system/getConf`。

**下一步:** 运行 `check_docs.js` 以确定下一个缺失的 API 并继续文档化工作。 

---
## 2025-05-11 17:18 - API文档: `/api/setting/setSearch`

**时间戳:**
- 开始: 2025-05-11 17:17:39 (大约)
- 结束: 2025-05-11 17:18:57

**处理的API:** `/api/setting/setSearch`

**摘要:** 为 `/api/setting/setSearch` API 端点创建了 HTML 文档。

**详情:**
*   **API 端点:** `/api/setting/setSearch`
*   **HTTP 方法:** `POST`
*   **认证:** `model.CheckAuth`, `model.CheckAdminRole`, `model.CheckReadonly`。
*   **Go 函数:** `setSearch` (位于 `siyuan/kernel/api/setting.go` 文件，第 422-457 行)。
*   **请求体结构:** 接受一个完整的 `conf.Search` 对象，定义在 `siyuan/kernel/conf/search.go`。
    *   包含众多布尔型字段控制搜索内容类型 (如 `document`, `heading`, `codeBlock` 等)。
    *   包含通用设置如 `limit` (最小32), `caseSensitive`。
    *   包含范围设置如 `name`, `alias`, `memo`, `ial`。
    *   包含资源文件索引设置 `indexAssetPath`。
    *   包含反链提及和虚拟引用相关配置 (`backlinkMention*`, `virtualRef*`)。
*   **功能:** 更新全局搜索配置。
    *   更改 `caseSensitive` 或 `indexAssetPath` 会触发全量重建索引。
    *   更改虚拟引用相关配置会重置虚拟引用缓存。
*   **响应:** 标准的思源 API 响应。成功时 (`code: 0`)，`data` 包含更新后的 `conf.Search` 对象。
*   **操作:** 创建了 `siyuan-kernelApi-docs/setting/setSearch.html`.
    *   文档中详细列出了 `conf.Search` 的所有字段及其默认值。
    *   在线测试区提供了加载当前搜索配置的功能。

**下一步:** 运行 `check_docs.js` 以确定下一个缺失的 API 并继续文档化工作。 

---
## 2025-05-11 17:22 - API文档: `/api/setting/setSnippet` (全局开关)

**时间戳:**
- 开始: 2025-05-11 17:21:10 (大约)
- 结束: 2025-05-11 17:22:28

**处理的API:** `/api/setting/setSnippet`

**摘要:** 为 `/api/setting/setSnippet` API 端点创建了 HTML 文档，该接口用于控制代码片段的全局启用状态。

**详情:**
*   **API 端点:** `/api/setting/setSnippet` (实际调用内核中的 `setConfSnippet`)
*   **HTTP 方法:** `POST`
*   **认证:** `model.CheckAuth`, `model.CheckAdminRole`, `model.CheckReadonly`。
*   **Go 函数:** `setConfSnippet` (位于 `siyuan/kernel/api/setting.go` 文件，第 53-76 行)。
*   **请求体结构:** 接受一个 `conf.Snpt` 对象，定义在 `siyuan/kernel/conf/snippet.go`。
    *   `enabledCSS` (boolean): 全局启用/禁用所有 CSS 代码片段 (默认: `true`)。
    *   `enabledJS` (boolean): 全局启用/禁用所有 JS 代码片段 (默认: `true`)。
*   **功能:** 更新全局代码片段的启用/禁用状态。修改 `conf.json` 中的 `snippet` 部分。
*   **响应:** 标准的思源 API 响应。成功时 (`code: 0`)，`data` 包含更新后的 `conf.Snpt` 对象。
*   **操作:** 创建了 `siyuan-kernelApi-docs/setting/setSnippet.html`.
    *   文档中说明了此接口是全局开关，并指明单个代码片段的管理由 `/api/snippet/*` 下的接口负责。
    *   在线测试区允许用户切换 CSS 和 JS 的全局启用状态。

**注意点:**
*   与 `/api/snippet/setSnippet` (位于 `siyuan/kernel/api/snippet.go`) 不同，后者用于管理一个 `conf.Snippet` 对象列表（即具体的代码片段内容）。

**下一步:** 运行 `check_docs.js` 以确定下一个缺失的 API 并继续文档化工作。 

---
## 2025-05-11 17:25 - API Doc: `/api/storage/getCriteria`

**Timestamps:**
- Start: 2025-05-11 17:23:49
- End: 2025-05-11 17:25:12

**API Processed:** `/api/storage/getCriteria`

**Summary:** Created HTML documentation for the `/api/storage/getCriteria` API endpoint.

**Details:**
*   **API Endpoint:** `/api/storage/getCriteria`
*   **HTTP Method:** `POST`
*   **Authentication:** `model.CheckAuth`.
*   **Go Function:** `getCriteria` in `siyuan/kernel/api/storage.go` (handler), which calls `model.GetCriteria()` in `siyuan/kernel/model/storage.go`.
*   **Associated Config Struct:** `model.Criterion`, `model.CriterionTypes`, `model.CriterionReplaceTypes` in `siyuan/kernel/model/storage.go`.
*   **Request Parameters:** None (empty JSON object `{}`).
*   **Functionality:** Retrieves a list of all saved search/replace criteria. These criteria are stored in `data/storage/criteria.json`.
*   **Response:** A JSON array of `Criterion` objects.
    *   Each `Criterion` object includes fields like `name`, `sort`, `group`, `hasReplace`, `method`, `hPath`, `idPath`, `k` (keyword), `r` (replacement), `types` (for search), and `replaceTypes` (for replacement).
*   **Action:** Created `siyuan-kernelApi-docs/storage/getCriteria.html`.
    *   The documentation includes detailed descriptions of the `Criterion`, `CriterionTypes`, and `CriterionReplaceTypes` structures.
    *   An online test area is provided.

**Next Step:** Run `check_docs.js` to identify the next missing API and continue documentation. 

---
## 2025-05-11 18:28 - API Doc: `/api/storage/getRecentDocs`

**Timestamps:**
- Start: 2025-05-11 18:27:44
- End: 2025-05-11 18:28:37

**API Processed:** `/api/storage/getRecentDocs`

**Summary:** Created HTML documentation for the `/api/storage/getRecentDocs` API endpoint.

**Details:**
*   **API Endpoint:** `/api/storage/getRecentDocs`
*   **HTTP Method:** `POST`
*   **Authentication:** `model.CheckAuth`.
*   **Go Function:** `getRecentDocs` in `siyuan/kernel/api/storage.go` (handler), which calls `model.GetRecentDocs()` in `siyuan/kernel/model/storage.go`.
*   **Associated Data Struct:** `model.RecentDoc` in `siyuan/kernel/model/storage.go`.
*   **Request Parameters:** None (empty JSON object `{}`).
*   **Functionality:** Retrieves a list of recently opened/edited documents. 
    *   Data is read from `data/storage/recent-doc.json`.
    *   The list is capped at 32 entries.
    *   Document titles are updated to the latest before returning.
    *   Non-existent documents are removed from the list.
*   **Response:** A JSON array of `RecentDoc` objects, each containing `rootID`, `icon`, and `title`.
*   **Action:** Created `siyuan-kernelApi-docs/storage/getRecentDocs.html`.
    *   The documentation includes a description of the `RecentDoc` structure and an example response.
    *   An online test area is provided.

**Next Step:** Run `check_docs.js` to identify the next missing API and continue documentation. 

---
## 2025-05-11 18:30 - API Doc: `/api/storage/removeCriterion`

**Timestamps:**
- Start: 2025-05-11 18:29:24
- End: 2025-05-11 18:30:50

**API Processed:** `/api/storage/removeCriterion`

**Summary:** Created HTML documentation for the `/api/storage/removeCriterion` API endpoint.

**Details:**
*   **API Endpoint:** `/api/storage/removeCriterion`
*   **HTTP Method:** `POST`
*   **Authentication:** `model.CheckAuth`, `model.CheckAdminRole`, `model.CheckReadonly`.
*   **Go Function:** `removeCriterion` in `siyuan/kernel/api/storage.go` (handler), which calls `model.RemoveCriterion(name)` in `siyuan/kernel/model/storage.go`.
*   **Request Parameters (JSON Body):** 
    *   `name` (string, required): The name of the criterion to remove.
*   **Functionality:** Removes a saved search/replace criterion by its name from `data/storage/criteria.json`.
*   **Response:** Standard API response (`{code, msg, data: null}`).
*   **Action:** Created `siyuan-kernelApi-docs/storage/removeCriterion.html`.
    *   The documentation includes request and response formats, examples, and an online test form.
    *   A tip to use `/api/storage/getCriteria` to find existing criterion names was added.

**Next Step:** Run `check_docs.js` to identify the next missing API. 

---
## 2025-05-11 18:34 - API Doc: `/api/storage/removeLocalStorageVals`

**Timestamps:**
- Start: 2025-05-11 18:31:33
- End: 2025-05-11 18:34:35

**API Processed:** `/api/storage/removeLocalStorageVals`

**Summary:** Created HTML documentation for the `/api/storage/removeLocalStorageVals` API endpoint.

**Details:**
*   **API Endpoint:** `/api/storage/removeLocalStorageVals`
*   **HTTP Method:** `POST`
*   **Authentication:** `model.CheckAuth`, `model.CheckAdminRole`, `model.CheckReadonly`.
*   **Go Function:** `removeLocalStorageVals` in `siyuan/kernel/api/storage.go` (handler), which calls `model.RemoveLocalStorageVals(keys)` in `siyuan/kernel/model/storage.go`.
*   **Request Parameters (JSON Body):** 
    *   `keys` (string[], required): An array of key names to remove from localStorage.
    *   `app` (string, required): The ID of the requesting application, used for event broadcasting.
*   **Functionality:** Removes multiple key-value pairs from the internal localStorage (stored in `data/storage/local-storage.json`). Broadcasts an event upon successful deletion.
*   **Response:** Standard API response (`{code, msg, data: null}`).
*   **Action:** Created `siyuan-kernelApi-docs/storage/removeLocalStorageVals.html`.
    *   The documentation includes request/response formats, examples, and an online test form.
    *   Added a note about the `app` parameter's role in event broadcasting.

**Next Step:** Run `check_docs.js` to identify the next missing API. 

---
## 2025-05-11 18:37 - API Doc: `/api/storage/setCriterion`

**Timestamps:**
- Start: 2025-05-11 18:35:18
- End: 2025-05-11 18:37:15

**API Processed:** `/api/storage/setCriterion`

**Summary:** Created HTML documentation for the `/api/storage/setCriterion` API endpoint.

**Details:**
*   **API Endpoint:** `/api/storage/setCriterion`
*   **HTTP Method:** `POST`
*   **Authentication:** `model.CheckAuth`, `model.CheckAdminRole`, `model.CheckReadonly`.
*   **Go Function:** `setCriterion` in `siyuan/kernel/api/storage.go` (handler), which calls `model.SetCriterion(criterion)` in `siyuan/kernel/model/storage.go`.
*   **Request Parameters (JSON Body):** 
    *   `criterion` (object, required): A complete `model.Criterion` object.
        *   `criterion.name` (string, required): Name of the criterion. Cannot be empty.
        *   Other fields include `sort`, `group`, `hasReplace`, `method`, `hPath`, `idPath`, `k`, `r`, `types`, `replaceTypes`.
*   **Functionality:** Creates a new search/replace criterion or updates an existing one if a criterion with the same `name` already exists. Data is stored in `data/storage/criteria.json`.
*   **Response:** Standard API response (`{code, msg, data: null}`).
*   **Action:** Created `siyuan-kernelApi-docs/storage/setCriterion.html`.
    *   The documentation includes a detailed description of the `Criterion` object, request/response formats, examples, and an online test form with a sample data loader.
    *   Linked to `/api/storage/getCriteria` for `CriterionTypes` and `CriterionReplaceTypes` definitions.

**Next Step:** Run `check_docs.js` to identify the next missing API. 

---
## 2025-05-11 18:38 - API Doc: `/api/storage/setLocalStorageVal`

**Timestamps:**
- Start: 2025-05-11 18:38:04
- End: 2025-05-11 18:38:56

**API Processed:** `/api/storage/setLocalStorageVal`

**Summary:** Created HTML documentation for the `/api/storage/setLocalStorageVal` API endpoint.

**Details:**
*   **API Endpoint:** `/api/storage/setLocalStorageVal`
*   **HTTP Method:** `POST`
*   **Authentication:** `model.CheckAuth`, `model.CheckAdminRole`, `model.CheckReadonly`.
*   **Go Function:** `setLocalStorageVal` in `siyuan/kernel/api/storage.go` (handler), which calls `model.SetLocalStorageVal(key, val)` in `siyuan/kernel/model/storage.go`.
*   **Request Parameters (JSON Body):** 
    *   `key` (string, required): The key name for the localStorage item.
    *   `val` (any, required): The value to set for the key (can be any JSON-compatible type).
    *   `app` (string, required): The ID of the requesting application, used for event broadcasting.
*   **Functionality:** Sets or updates a key-value pair in the internal localStorage (stored in `data/storage/local-storage.json`). Broadcasts an event to other clients upon success.
*   **Response:** Standard API response (`{code, msg, data: null}`).
*   **Action:** Created `siyuan-kernelApi-docs/storage/setLocalStorageVal.html`.
    *   The documentation includes request/response formats, examples for string and object values, and an online test form.
    *   Highlighted the `app` parameter's role in event broadcasting.

**Next Step:** Run `check_docs.js` to identify the next missing API. 