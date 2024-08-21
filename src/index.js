// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';
dotenv.config({path:'./env'});
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log("sever is running at port " + process.env.PORT)
    })
})
.catch(err=>{
    console.log("mongo connection error: " + err);
    throw err
})









//first approach
// const app = express();

// ;(async () => {
//     try {
//         const dbResponse = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//         app.on("error", () => console.log(dbResponse, "Error: dbResponse"))
//         app.listen(process.env.PORT, () => {
//             console.log(`Application is running on port ${process.env.PORT}`);
//         });
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// })();
