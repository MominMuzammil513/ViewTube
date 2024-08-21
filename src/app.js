import userRouter from "./routes/user.routes.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({limit:"16kB"}))
app.use(express.urlencoded({extended:true,limit:"16kB"}))
app.use(express.static("public"))

//routes imported


// routes declarations

app.use('/api/v1/users',userRouter);


export { app };
