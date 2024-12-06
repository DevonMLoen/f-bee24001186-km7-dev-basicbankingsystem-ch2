const createApp = require("./utils/create-app");
const app = createApp();

console.log("process.env.NODE_ENV");
console.log(process.env.NODE_ENV);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
