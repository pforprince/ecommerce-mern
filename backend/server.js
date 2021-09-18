const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const colors = require("colors");
const db = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");
db();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API IS RUNNING...");
});

app.use("/api/products", require("./routes/ProductRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
// app.use(errorMiddleware.notFound);
app.use(errorMiddleware.errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`SERVER RUNNING ON ${PORT}`.yellow.bold));
