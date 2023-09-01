import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

//Route
import pdfRoute from "./pdfRoute.js";

const app = express();
const port = process.env.PORT || 3001;;

// Set up EJS
app.use(bodyParser.json({ limit: "5mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    extended: true,
    parameterLimit: 5000,
  })
);
app.set("view engine", "ejs");

// Set up CORS
app.use(cors()); //Enable CORS on all routes
app.use(express.json()); //Automatically decode JSON data

/////////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Listening on port ${port} ✅`);
});
//Service status
app.get("/", (req, res) => {
  res.status(200).send("Pdf Maker Service - Up and Running ✅");
});
/////////////////////////////////////////////////////////////
app.use("/pdf", pdfRoute);

