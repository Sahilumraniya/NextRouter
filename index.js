import express from "express";
import fs from "fs";
const app = express();
const FILE_ROUTER = "./api/";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function handleRegularRoutes(fileUrl, req, res) {
  try {
    const module = await import(fileUrl);
    const httpVerb = req.method.toLowerCase();
    let data = null;
    console.log("Method : ", httpVerb);
    if (module.handler) {
      data = module.handler(req, res);
    } else if (module[httpVerb]) {
      data = module[httpVerb](req, res);
    } else {
      return false;
    }
    return data;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function handleDynamicRoutes(folderName) {
  try {
    const files = fs.readdirSync(folderName);
    // console.log("file : ", files);
    if(files.length > 1) {
        return false;
    }
    const dynamicaFileName = files.find((file) =>
      file.match(/\[[a-zA-Z0-9\._]+\]/)
    );
    console.log(dynamicaFileName);
    return {
      file: dynamicaFileName,
      parms: dynamicaFileName.replace("[", "").replace("].js", ""),
    };
  } catch (err) {
    console.log("Error: " + err);
    return null;
  }
}

app.all("/*", async (req, res) => {
  console.log(req.url);
  let fileUrl = (FILE_ROUTER + req.url).replace("//", "/");
  let isfile = fs.existsSync(fileUrl + ".js");
  if (!isfile) {
    fileUrl += "/index.js";
  } else {
    fileUrl += ".js";
  }
  console.log(fileUrl);
  let result = await handleRegularRoutes(fileUrl, req, res);
  if (result) {
    res.send(result);
  } else {
    const pathAarry = (FILE_ROUTER + req.url).replace("//", "/").split("/");
    let parms = pathAarry.pop();
    console.log("path : ", pathAarry);
    console.log("p:", parms);
    const isDynamically = await handleDynamicRoutes(pathAarry.join("/"));
    if (isDynamically) {
      console.log("Dynamic : ", isDynamically);
      req.params = { ...req.params, [isDynamically.parms]: parms };
      const file_name = [pathAarry.join("/"), isDynamically.file].join("/");
      console.log("params : ", req.params);
      result = await handleRegularRoutes(file_name, req, res);
      console.log(result);
      res.send(result);
    } else {
      res.status(404).json({ message: "Couldn't find Routes" });
    }
  }
});

app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
