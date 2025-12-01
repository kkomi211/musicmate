const express = require('express')
const cors = require('cors')

// const stuRouter = require("./routes/student");
// const productRouter = require("./routes/product");
const userRouter = require("./routes/user");
const feedRouter = require("./routes/feed");
const messageRouter = require("./routes/message");
const dealRouter = require("./routes/deal");
const bandRouter = require("./routes/band");
const eventRouter = require("./routes/event");
const ensembleRouter = require("./routes/ensemble");
const alertRouter = require("./routes/alert");
const path = require("path");


const app = express()

app.use(cors({
    origin: "*",
    credentials: true
}))
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//  router 영역
// app.use("/student", stuRouter);
// app.use("/product", productRouter );
app.use("/user", userRouter );
app.use("/feed", feedRouter );
app.use("/message", messageRouter );
app.use("/deal", dealRouter );
app.use("/band", bandRouter );
app.use("/event", eventRouter );
app.use("/ensemble", ensembleRouter );
app.use("/alert", alertRouter );




app.listen(3010, () => {
    console.log("server start!");
})