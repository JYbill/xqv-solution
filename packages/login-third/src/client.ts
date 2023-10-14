import { PrismaClient } from "@prisma/client";

async function client() {
  const client = new PrismaClient().$extends({
    query: {
      $allOperations({ model, operation, args, query }) {
        console.log("query");
        return query(args);
      },
    },
  });
  await client.$connect();
  console.log(await client.user.findMany());
}
client();
export {};
