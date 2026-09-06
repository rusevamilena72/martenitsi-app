# Преместване на сайта от Bolt към Netlify + твой Supabase акаунт

Ръководство стъпка по стъпка за твоя проект "Martenitsi Listing App".

## Какво точно се случва при Bolt

Когато правиш сайт в Bolt и не си свързал изрично свой собствен Supabase акаунт, Bolt автоматично създава база данни в **своя собствена (служебна) Supabase организация** — това е т.нар. "Bolt Database". Ти виждаш само `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` в `.env` файла, но самият Supabase проект технически принадлежи на Bolt, не на теб.

Bolt предлага вграден механизъм точно за този случай — **"Claim your database"** — с който прехвърляш собствеността на базата данни към твой собствен Supabase акаунт, без да губиш данни (потребители, обяви, снимки, поръчки). Това е официалният и най-чист начин, затова го използваме тук.

Отделно, откакто Bolt пусна собствен хостинг ("Bolt Hosting") през август 2025 г., има ограничение: ако проектът вече е публикуван през Bolt Hosting, Bolt не позволява после публикуване към Netlify от техния интерфейс (освен като направиш непубликувано копие). Ние заобикаляме това изцяло, като не минаваме през бутона "Deploy" на Bolt — вместо това качваме кода в GitHub и свързваме Netlify директно с хранилището. Това е напълно нормален и поддържан начин на работа, независимо от статуса на проекта в Bolt.

Източници: [Bolt – Supabase интеграция](https://support.bolt.new/integrations/supabase) · [Bolt – бази данни](https://support.bolt.new/concepts/intro-databases) · [Migrate Off Bolt.new in 2026](https://axonbuild.com/blog/migrate-off-bolt-new)

---

## Част 1: Прехвърляне на базата данни към твоя Supabase акаунт ("Claim")

Изисква се да си **owner (собственик)** на организация в твоя Supabase акаунт — по подразбиране всеки нов акаунт вече е owner на своята лична организация, така че това би трябвало да важи за теб.

1. Влез в **bolt.new** и отвори проекта на сайта.
2. Провери дали Bolt е свързан с *твоя* Supabase акаунт: **Settings → Integrations → Supabase**. Ако не е свързан (или е свързан с друг акаунт), натисни "Connect" и влез с твоя собствен Supabase login.
3. В самия проект натисни иконата **Database** (горе в центъра на екрана).
4. Отвори таб **Advanced**.
5. Натисни бутона **Claim**.
6. Ще те прехвърли към Supabase — довърши стъпките там (избери организацията, в която да се прехвърли проектът, и потвърди).
7. Влез в [supabase.com/dashboard](https://supabase.com/dashboard) и провери, че проектът вече се вижда в твоята организация (ако не се вижда веднага, презареди страницата).

**Важно:** Bolt изрично предупреждава, че тяхната функция "Version History" (връщане към предишна версия) няма да работи със Supabase база данни след claim-ване — но самите ти данни не се засягат от това.

### Провери ключовете след claim

Обикновено `Project URL` и `anon public key` остават същите като преди (`https://kivkdgpxnxwcgrpurgxw.supabase.co` според твоя текущ `.env`), защото е същият проект, само сменя собственика. За всеки случай провери в Supabase Dashboard:

**Project Settings → API** → сравни `Project URL` и `anon public` ключ с тези в твоя `.env` файл. Ако има разлика, обнови `.env` (виж `.env.example` в проекта — копирай го на `.env` и попълни реалните стойности).

---

## Част 2: Edge Functions (имейли за контакт и поръчки) + Resend

Сайтът има две Supabase Edge Functions, които изпращат имейл до `rusevamilena72@gmail.com` при нова поръчка или ново съобщение от контактната форма:

- `supabase/functions/send-contact-email`
- `supabase/functions/send-order-email`

Те би трябвало да се прехвърлят автоматично заедно с проекта при claim-ването (провери в Supabase Dashboard → **Edge Functions**, дали и двете се виждат). И на двете им трябва **тайна променлива** `RESEND_API_KEY`, която досега е стояла само в служебния акаунт на Bolt — затова трябва да си направиш собствена:

1. Направи безплатен акаунт в [resend.com](https://resend.com).
2. От Dashboard → **API Keys** → създай нов ключ (например "martenitsi-prod"). Копирай го веднага — показва се само веднъж.
3. Добави го като secret в новия Supabase проект. Най-лесно през Dashboard:
   - **Project Settings → Edge Functions → Manage secrets** (или **Functions → Secrets**, в зависимост от версията на интерфейса)
   - Добави `RESEND_API_KEY` = твоя ключ.
   - Ако вместо това предпочиташ през командния ред: `supabase login`, после `supabase link --project-ref <project-ref>`, после `supabase secrets set RESEND_API_KEY=re_xxxxxxxx`.
4. Ако Edge Functions не са се прехвърлили автоматично при claim-a, редеплойни ги ръчно от папката на проекта: `supabase functions deploy send-contact-email` и `supabase functions deploy send-order-email`.

**Важен нюанс за Resend:** кодът в момента изпраща от адрес `onboarding@resend.dev` — това е тестов ("sandbox") адрес на Resend, който по подразбиране може да изпраща само към **имейла, с който си регистрирана в Resend**. Понеже получателят в кода е точно `rusevamilena72@gmail.com`, ако се регистрираш в Resend с този имейл, изпращането ще работи веднага без допълнителна настройка. Ако по-късно искаш имейли да тръгват от твой собствен домейн (напр. `poruchki@tvoiat-domein.bg`), трябва да верифицираш домейна в Resend (**Domains → Add Domain** + добавяне на DNS записи) и да смениш `from` адреса в двата edge функции.

---

## Част 3: Качване на кода в GitHub

1. Създай ново хранилище (repository) в [github.com](https://github.com) — напр. `martenitsi-app`. Остави го празно (без README).
2. В папката на проекта локално (файловете от този zip):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ТВОЕ-ПОТРЕБИТЕЛСКО-ИМЕ/martenitsi-app.git
   git push -u origin main
   ```
   `.env` файлът **няма** да се качи (вече е в `.gitignore`) — това е правилно, тайните ключове не бива да влизат в GitHub.

---

## Част 4: Свързване с Netlify

1. Влез в [app.netlify.com](https://app.netlify.com).
2. **Add new site → Import an existing project → Deploy with GitHub**, избери хранилището `martenitsi-app`.
3. Netlify би трябвало автоматично да прочете `netlify.toml` (вече го добавих в проекта) и да зададе:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Преди първия деплой, добави environment variables: **Site configuration → Environment variables → Add a variable**:
   - `VITE_SUPABASE_URL` = твоя Project URL от Supabase
   - `VITE_SUPABASE_ANON_KEY` = твоя anon public ключ от Supabase
5. Натисни **Deploy site**.
6. След като приключи build-ът, Netlify ще ти даде адрес от типа `random-name-123.netlify.app` — отвори го и тествай сайта.
7. По желание: **Site configuration → Domain management** — добави твой собствен домейн, ако имаш такъв.

`netlify.toml`-ът, който вече е в проекта, включва и SPA redirect правило (`/* → /index.html`), без което презареждане на страница като `/grivni` или `/profile` би дало 404 грешка при клиентски рутинг (React Router).

---

## Част 5: Тест накрая

Провери в реалния Netlify адрес:

- Регистрация и логин на потребител
- Добавяне на нова обява със снимки
- Разглеждане на категории (Гривни, Цветя, Гердани и т.н.)
- Изпращане на съобщение през формата за контакт → провери дали пристига имейл
- Направа на поръчка → провери дали пристига имейл

Ако имейлите не пристигат, провери **Supabase Dashboard → Edge Functions → send-contact-email/send-order-email → Logs** за грешки (най-честата причина е грешен или липсващ `RESEND_API_KEY`).

---

## Част 6: Какво да правиш с Bolt проекта след това

Не е нужно веднага да триеш нищо в Bolt. След като провериш, че всичко работи през Netlify + твоя Supabase, можеш спокойно:

- да спреш да плащаш/ползваш Bolt hosting за този проект (ако си плащала за него),
- или просто да го оставиш архивиран в Bolt като резервно копие на кода.

Базата данни вече е твоя собственост в Supabase, независимо какво правиш с Bolt проекта оттук нататък.

---

## Файлове, добавени към проекта за тази миграция

- `netlify.toml` — конфигурация на build и SPA routing за Netlify.
- `.env.example` — шаблон за environment променливите (копирай на `.env` и попълни реални стойности; не се качва в git).

## Източници

- [Bolt Supabase integration docs](https://support.bolt.new/integrations/supabase)
- [Bolt — Introduction to databases](https://support.bolt.new/concepts/intro-databases)
- [Bolt — Database authentication settings](https://support.bolt.new/cloud/database/authentication)
- [Migrate Off Bolt.new in 2026: What Exports, What Doesn't](https://axonbuild.com/blog/migrate-off-bolt-new)
