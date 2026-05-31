<p align="right">
  <a href="./README.md">简体中文</a> |
  <a href="./README.en.md">English</a>
</p>

# Chatbox Plus

Chatbox Plus is an unofficial enhanced fork of [Chatbox Community Edition](https://github.com/chatboxai/chatbox). It keeps the local-first, cross-platform, multi-provider desktop client foundation from Chatbox and adds extensions around provider management, model capabilities, chat workflows, tooling, mobile builds, and debugging.

This project is not affiliated with ChatboxAI or the upstream Chatbox project. Chatbox Plus is distributed under the [GPLv3 License](./LICENSE).

## Documentation

- The original Chatbox README has been archived at [docs/archived-chatbox-readme.md](./docs/archived-chatbox-readme.md)
- Upstream repository: [chatboxai/chatbox](https://github.com/chatboxai/chatbox)
- FAQ: [doc/FAQ.md](./doc/FAQ.md)
- Technical documentation: [docs/](./docs/)

## Chatbox Plus Extensions

Chatbox Plus maintains the upstream Community Edition base and adds the following extension areas:

- **Clearer provider architecture**: unifies built-in providers, OpenAI-compatible providers, custom providers, and model metadata resolution.
- **Enhanced model capability management**: preserves and merges saved model capabilities such as vision, tool use, reasoning, and web search instead of overwriting user configuration.
- **Improved OpenAI-compatible support**: better behavior for third-party OpenAI-compatible services, including model lists, Base URL, API Path, streaming, and vision input.
- **More reliable vision input flow**: improves image upload, storage, model-message conversion, and error reporting so unreadable images are not silently sent as text-only prompts.
- **Mobile build and storage work**: maintains Android/Capacitor build support with mobile SQLite storage and image blob compatibility considerations.
- **Local-first BYOK usage**: users configure their own providers and API keys; upstream commercial account, subscription, and license services are not part of Chatbox Plus.
- **Developer-facing diagnostics and tests**: adds focused tests around provider contracts, model registries, message conversion, mobile requests, and model capabilities.

## Downloads

Builds are published on this fork's [GitHub Releases](https://github.com/Labyrinth0419/chatbox-plus/releases). If no release is available, build from source.

Official Chatbox downloads, mobile store listings, paid services, account services, and license services belong to the upstream project and are not part of Chatbox Plus.

## Quick Start

### Requirements

- Node.js 20.x to 22.x
- pnpm 10.x or later
- Git

### Development

```bash
git clone https://github.com/Labyrinth0419/chatbox-plus.git
cd chatbox-plus
pnpm install
pnpm run dev
```

### Common Commands

| Command | Description |
| --- | --- |
| `pnpm run dev` | Start desktop development mode |
| `pnpm run build` | Build for production |
| `pnpm run package` | Package for the current platform |
| `pnpm run package:all` | Package for all supported platforms |
| `pnpm run mobile:sync:android` | Sync the Android project |
| `pnpm run test` | Run tests |
| `pnpm run lint` | Run lint checks |

## Platform Support

Chatbox Plus is mainly maintained for:

- Windows
- macOS
- Linux
- Android
- Web builds

Platform-specific capabilities can differ, especially around local file parsing, system integrations, mobile storage, and package distribution.

## Contributing

Issues and pull requests are welcome. Before submitting code, run the tests relevant to your change and keep the scope focused.

Good contribution areas include:

- Provider compatibility fixes
- Model capability metadata
- Mobile experience improvements
- Vision input, tool use, and file parsing fixes
- Documentation and tests

## License

Chatbox Plus follows the [GPLv3 License](./LICENSE). This project is a GPLv3 fork of Chatbox Community Edition, and modified source code, build scripts, and related documentation are maintained in this repository.
