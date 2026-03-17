# roleplai

A local "group chat" where multiple AI participants — each with a custom persona and powered by a different model — can converse together in a shared thread.

## What it does

- Create named AI **participants** (e.g. "Aristotle" on Claude, "Feynman" on GPT-4o) with custom system prompts
- Start **chats** and add any combination of participants
- Send messages to the group; by default the last-responding participant replies
- **@mention** a specific participant to address them directly
- Two **context modes**: full history or windowed (last N messages) for token efficiency

## Supported providers

| Provider | Models |
|---|---|
| Anthropic | Claude Opus 4.6, Sonnet 4.6, Haiku 4.5 |
| OpenAI | GPT-4o, GPT-4o Mini, o3, o1 |
| Google | Gemini 2.5 Pro, Gemini 2.0 Flash |
| Ollama | Any locally-running model (fetched dynamically) |

## Setup

### 1. Clone & install

```bash
git clone https://github.com/your-username/roleplai
cd roleplai
npm install
```

### 2. Configure API keys

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
OLLAMA_BASE_URL=http://localhost:11434   # optional, defaults to localhost
```

You only need keys for the providers you want to use. For Ollama, make sure Ollama is running locally with at least one model pulled (`ollama pull llama3.2`).

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Go to **Settings** → confirm your provider keys show green
2. Go to **Participants** → create a participant (name + provider + model + system prompt)
3. Click **New Chat** in the sidebar → open chat settings → add participants
4. Start chatting!

### @mention

Type `@Name` at the start of your message to direct it to a specific participant:

```
@Socrates what do you think about the examined life?
```

Without a mention, the last participant who replied will respond (or the first one added to the chat).

### Context modes

Open chat settings (⚙ icon) to switch between:

- **Full history** — every message is sent with each request
- **Windowed** — only the last N messages are included (configurable)

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [Vercel AI SDK v6](https://sdk.vercel.ai/)
- [Zustand](https://github.com/pmndrs/zustand) (persisted state)
- [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS
- [nanoid](https://github.com/ai/nanoid)
