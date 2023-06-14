yarn add prisma@4.8.0 -D

set PRISMA_CLI_QUERY_ENGINE_TYPE=binary
set PRISMA_CLIENT_ENGINE_TYPE=binary

npx prisma init
npx prisma db pull
npx prisma generate

npx prisma migrate dev --name AddBirthAt
npx prisma generate
