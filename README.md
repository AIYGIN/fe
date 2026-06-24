This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## TODO BFF疎通

`/todo` はデフォルトでブラウザMSWを有効化せず、Orval生成clientからBFFへ接続します。BFF hostは `NEXT_PUBLIC_API_HOST` を指定した場合はその値、未指定時は `http://localhost:3001` を使います。

```bash
NEXT_PUBLIC_API_HOST=http://localhost:3001 pnpm dev
```

Storybookやブラウザ上でTODO APIをMSWへ向けたい場合だけ、次の環境変数を指定します。

```bash
NEXT_PUBLIC_TODO_ENABLE_BROWSER_MOCK=true pnpm dev
```

実BFF疎通では、BFF側でCookie credential付きCORSを許可し、ログイン済みのHttpOnly Cookieが送信される状態で確認します。TODO所有者はBFFがCookie内JWTから復元するため、FEは `userId` / `ownerUserId` / `ownerDisplayName` をrequest body/queryへ渡しません。API契約が `TodoDto(id,title,completed,createdAt)`、`CreateTodoRequestDto(title)`、`UpdateTodoRequestDto(completed)` から変わらない場合、`src/apis/generated` 配下のOrval生成物は変更しません。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## AIツールの勧め

- [Codex](https://openai.com/ja-JP/codex/)
- [headroom](https://github.com/chopratejas/headroom)
- [codegraph](https://github.com/colbymchenry/codegraph)
- [Hermes Agent](https://hermes-agent.org/ja/)
- [agentmemory](https://github.com/rohitg00/agentmemory)
