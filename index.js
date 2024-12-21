// importing libraries
import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path fom "path";

// creating express app
const app = express();

// setting up multer middleware
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + uuid() + '-' + path.extname(file.originalname));
    },
});

// multer configuration
const upload = multer({
    storage: storage,
})


// setting up cors
app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
    })
);

// middleware 
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
})

// express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// where to keep all static files
app.use('/uploads', express.static('uploads'));

// basic code to check initial state
app.get("/", function (req, res) {
    res.json({
        message: "Welcome",
    });
});

// endpoint to upload a file to the server
app.post("/upload", upload.single("file"), function (req, res) {
    console.log("file uploaded");
});

app.listen(8000, function () {
    console.log("Server is running on port 3000");
});
