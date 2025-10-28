Use Supabase with Next.js | Supabase Docs

===============

[![Image 1: Supabase wordmark](https://supabase.com/docs/supabase-dark.svg)![Image 2: Supabase wordmark](https://supabase.com/docs/supabase-light.svg)DOCS](https://supabase.com/docs)

*   [Start](https://supabase.com/docs/guides/getting-started)
*   Products
*   Build
*   Manage
*   Reference
*   Resources

[![Image 3: Supabase wordmark](https://supabase.com/docs/supabase-dark.svg)![Image 4: Supabase wordmark](https://supabase.com/docs/supabase-light.svg)DOCS](https://supabase.com/docs)

Search docs...

K

Main menu

[Start with Supabase](https://supabase.com/docs/guides/getting-started)

*   [Features](https://supabase.com/docs/guides/getting-started/features)

*   [Architecture](https://supabase.com/docs/guides/getting-started/architecture)

Framework Quickstarts*   [Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
*   [React](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
*   [Nuxt](https://supabase.com/docs/guides/getting-started/quickstarts/nuxtjs)
*   [Vue](https://supabase.com/docs/guides/getting-started/quickstarts/vue)
*   [Hono](https://supabase.com/docs/guides/getting-started/quickstarts/hono)
*   [Flutter](https://supabase.com/docs/guides/getting-started/quickstarts/flutter)
*   [iOS SwiftUI](https://supabase.com/docs/guides/getting-started/quickstarts/ios-swiftui)
*   [Android Kotlin](https://supabase.com/docs/guides/getting-started/quickstarts/kotlin)
*   [SvelteKit](https://supabase.com/docs/guides/getting-started/quickstarts/sveltekit)
*   [Laravel PHP](https://supabase.com/docs/guides/getting-started/quickstarts/laravel)
*   [Ruby on Rails](https://supabase.com/docs/guides/getting-started/quickstarts/ruby-on-rails)
*   [SolidJS](https://supabase.com/docs/guides/getting-started/quickstarts/solidjs)
*   [RedwoodJS](https://supabase.com/docs/guides/getting-started/quickstarts/redwoodjs)
*   [refine](https://supabase.com/docs/guides/getting-started/quickstarts/refine)

Web app demos*   [Next.js](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
*   [React](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
*   [Vue 3](https://supabase.com/docs/guides/getting-started/tutorials/with-vue-3)
*   [Nuxt 3](https://supabase.com/docs/guides/getting-started/tutorials/with-nuxt-3)
*   [Angular](https://supabase.com/docs/guides/getting-started/tutorials/with-angular)
*   [RedwoodJS](https://supabase.com/docs/guides/getting-started/tutorials/with-redwoodjs)
*   [SolidJS](https://supabase.com/docs/guides/getting-started/tutorials/with-solidjs)
*   [Svelte](https://supabase.com/docs/guides/getting-started/tutorials/with-svelte)
*   [SvelteKit](https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit)
*   [refine](https://supabase.com/docs/guides/getting-started/tutorials/with-refine)

Mobile tutorials*   [Flutter](https://supabase.com/docs/guides/getting-started/tutorials/with-flutter)
*   [Expo React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
*   [Android Kotlin](https://supabase.com/docs/guides/getting-started/tutorials/with-kotlin)
*   [Ionic React](https://supabase.com/docs/guides/getting-started/tutorials/with-ionic-react)
*   [Ionic Vue](https://supabase.com/docs/guides/getting-started/tutorials/with-ionic-vue)
*   [Ionic Angular](https://supabase.com/docs/guides/getting-started/tutorials/with-ionic-angular)
*   [Swift](https://supabase.com/docs/guides/getting-started/tutorials/with-swift)

AI Tools

Prompts

*   [Model context protocol (MCP)](https://supabase.com/docs/guides/getting-started/mcp)

[![Image 5: Supabase wordmark](https://supabase.com/docs/supabase-dark.svg)![Image 6: Supabase wordmark](https://supabase.com/docs/supabase-light.svg)DOCS](https://supabase.com/docs)

*   [Start](https://supabase.com/docs/guides/getting-started)
*   Products
*   Build
*   Manage
*   Reference
*   Resources

[![Image 7: Supabase wordmark](https://supabase.com/docs/supabase-dark.svg)![Image 8: Supabase wordmark](https://supabase.com/docs/supabase-light.svg)DOCS](https://supabase.com/docs)

Search docs...

K

Getting Started

Use Supabase with Next.js
=========================

Learn how to create a Supabase project, add some sample data, and query from a Next.js app.
-------------------------------------------------------------------------------------------

* * *

1

### Create a Supabase project

Go to [database.new](https://database.new/) and create a new Supabase project.

Alternatively, you can create a project using the Management API:

`1234567891011121314151617# First, get your access token from https://supabase.com/dashboard/account/tokensexport SUPABASE_ACCESS_TOKEN="your-access-token"# List your organizations to get the organization IDcurl -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \  https://api.supabase.com/v1/organizations# Create a new project (replace <org-id> with your organization ID)curl -X POST https://api.supabase.com/v1/projects \  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \  -H "Content-Type: application/json" \  -d '{    "organization_id": "<org-id>",    "name": "My Project",    "region": "us-east-1",    "db_pass": "<your-secure-password>"  }'`

When your project is up and running, go to the [Table Editor](https://supabase.com/dashboard/project/_/editor), create a new table and insert some data.

Alternatively, you can run the following snippet in your project's [SQL Editor](https://supabase.com/dashboard/project/_/sql/new). This will create a `instruments` table with some sample data.

`12345678910111213-- Create the tablecreate table instruments (  id bigint primary key generated always as identity,  name text not null);-- Insert some sample data into the tableinsert into instruments (name)values  ('violin'),  ('viola'),  ('cello');alter table instruments enable row level security;`

Make the data in your table publicly readable by adding an RLS policy:

`1234create policy "public can read instruments"on public.instrumentsfor select to anonusing (true);`

2

### Create a Next.js app

Use the `create-next-app` command and the `with-supabase` template, to create a Next.js app pre-configured with:

*   [Cookie-based Auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=package-manager&package-manager=npm&queryGroups=framework&framework=nextjs&queryGroups=environment&environment=server)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)

`1npx create-next-app -e with-supabase`

3

### Declare Supabase Environment Variables

Rename `.env.example` to `.env.local` and populate with your Supabase connection variables:

###### Project URL

No project found

###### Publishable key

No project found

###### Anon key

No project found

.env.local

`12NEXT_PUBLIC_SUPABASE_URL=<SUBSTITUTE_SUPABASE_URL>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<SUBSTITUTE_SUPABASE_PUBLISHABLE_KEY>`

4

### Create Supabase client

Create a new file at `utils/supabase/server.ts` and populate with the following.

This creates a Supabase client, using the credentials from the `env.local` file.

utils/supabase/server.ts

`1234567891011121314151617181920212223242526272829import { createServerClient } from '@supabase/ssr'import { cookies } from 'next/headers'export async function createClient() {  const cookieStore = await cookies()  return createServerClient(    process.env.NEXT_PUBLIC_SUPABASE_URL!,    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,    {      cookies: {        getAll() {          return cookieStore.getAll()        },        setAll(cookiesToSet) {          try {            cookiesToSet.forEach(({ name, value, options }) =>              cookieStore.set(name, value, options)            )          } catch {            // The `setAll` method was called from a Server Component.            // This can be ignored if you have middleware refreshing            // user sessions.          }        },      },    }  )}`

5

### Query Supabase data from Next.js

Create a new file at `app/instruments/page.tsx` and populate with the following.

This selects all the rows from the `instruments` table in Supabase and render them on the page.

app/instruments/page.tsx

`12345678import { createClient } from '@/utils/supabase/server';export default async function Instruments() {  const supabase = await createClient();  const { data: instruments } = await supabase.from("instruments").select();  return <pre>{JSON.stringify(instruments, null, 2)}</pre>}`

6

### Start the app

Run the development server, go to [http://localhost:3000/instruments](http://localhost:3000/instruments) in a browser and you should see the list of instruments.

`1npm run dev`

Next steps[#](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs#next-steps)
---------------------------------------------------------------------------------------------

*   Set up [Auth](https://supabase.com/docs/guides/auth) for your app
*   [Insert more data](https://supabase.com/docs/guides/database/import-data) into your database
*   Upload and serve static files using [Storage](https://supabase.com/docs/guides/storage)

[Edit this page on GitHub](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/getting-started/quickstarts/nextjs.mdx)

*   Need some help?

[Contact support](https://supabase.com/support)
*   Latest product updates?

[See Changelog](https://supabase.com/changelog)
*   Something's not right?

[Check system status](https://status.supabase.com/)

* * *

[© Supabase Inc](https://supabase.com/)—[Contributing](https://github.com/supabase/supabase/blob/master/apps/docs/DEVELOPERS.md)[Author Styleguide](https://github.com/supabase/supabase/blob/master/apps/docs/CONTRIBUTING.md)[Open Source](https://supabase.com/open-source)[SupaSquad](https://supabase.com/supasquad)Privacy Settings

[GitHub](https://github.com/supabase/supabase)

[Content truncated for performance]