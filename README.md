<p align="right">
  <a href="./README.md">简体中文</a> |
  <a href="./README.en.md">English</a>
</p>

# Chatbox Plus

Chatbox Plus 是基于 [Chatbox Community Edition](https://github.com/chatboxai/chatbox) 的非官方增强版 fork。它延续 Chatbox 本地优先、跨平台、多模型客户端的基础能力，并在模型供应商、会话体验、工具集成、移动端构建和调试便利性等方向加入扩展。

本项目与 ChatboxAI 或上游 Chatbox 项目无隶属关系。项目遵循 [GPLv3 License](./LICENSE) 发布。

## 文档索引

- 原 Chatbox README 已归档到：[docs/archived-chatbox-readme.md](./docs/archived-chatbox-readme.md)
- 上游项目仓库：[chatboxai/chatbox](https://github.com/chatboxai/chatbox)
- 常见问题：[doc/FAQ-CN.md](./doc/FAQ-CN.md)
- 技术文档：[docs/](./docs/)

## Chatbox Plus 的扩展功能

Chatbox Plus 在上游 Community Edition 的基础上，重点加入和维护以下扩展：

- **更清晰的模型供应商体系**：统一内置供应商、OpenAI 兼容供应商、自定义供应商和模型元数据读取链路，降低新增供应商和维护模型能力的成本。
- **模型能力管理增强**：支持保存和合并模型的视觉、工具调用、推理、联网搜索等能力，避免用户配置被运行时或 registry 数据覆盖。
- **OpenAI 兼容模型适配改进**：面向第三方 OpenAI-compatible 服务优化模型列表、Base URL、API Path、stream 和视觉输入等使用场景。
- **视觉输入链路增强**：改进图片上传、存储、模型消息转换和错误暴露，避免图片读取失败时被静默降级成纯文本请求。
- **移动端构建与存储适配**：维护 Android/Capacitor 构建链路，并针对移动端 SQLite 存储、图片 blob、文件解析限制等场景做兼容。
- **本地优先与自带 Key 使用方式**：默认由用户配置自己的模型服务和 API Key，不依赖上游商业账号、订阅或 License 服务。
- **开发与调试便利性**：补充模型注册表、供应商契约、消息转换、移动端请求等测试覆盖，便于定位模型能力、图片输入、工具调用相关问题。

## 下载

构建产物会发布在本 fork 的 [GitHub Releases](https://github.com/Labyrinth0419/chatbox-plus/releases)。如果当前没有可用 release，可以从源码构建。

上游 Chatbox 的官方下载链接、移动端商店页面、付费服务、账号和 License 服务不属于 Chatbox Plus。

## 快速开始

### 环境要求

- Node.js 20.x 到 22.x
- pnpm 10.x 或更高版本
- Git

### 开发运行

```bash
git clone https://github.com/Labyrinth0419/chatbox-plus.git
cd chatbox-plus
pnpm install
pnpm run dev
```

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm run dev` | 启动桌面端开发环境 |
| `pnpm run build` | 生产构建 |
| `pnpm run package` | 为当前平台打包 |
| `pnpm run package:all` | 为所有支持平台打包 |
| `pnpm run mobile:sync:android` | 同步 Android 工程 |
| `pnpm run test` | 运行测试 |
| `pnpm run lint` | 运行代码检查 |

## 平台支持

Chatbox Plus 主要面向以下平台维护：

- Windows
- macOS
- Linux
- Android
- Web 构建

不同平台的可用能力可能存在差异，尤其是本地文件解析、系统级集成、移动端存储和安装包分发。

## 贡献

欢迎通过 Issue 和 Pull Request 参与项目。提交代码前建议至少运行和改动相关的测试，并保持改动范围清晰。

适合贡献的方向包括：

- 修复模型供应商兼容问题
- 补充模型能力元数据
- 改进移动端体验
- 修复视觉输入、工具调用、文件解析等会话链路问题
- 完善文档和测试

## License

Chatbox Plus 遵循 [GPLv3 License](./LICENSE)。本项目是 Chatbox Community Edition 的 GPLv3 fork，修改源码、构建脚本和相关文档均在本仓库中维护。
