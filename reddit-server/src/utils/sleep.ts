export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// create migrations
// npx typeorm migration:create -n FakePosts -d src/migrations