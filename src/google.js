const NodeGoogleDrive = require("node-google-drive");
const Path = require("path");
const fs = require("fs");

const googleDriveInstance = new NodeGoogleDrive({
  ROOT_FOLDER: process.env.ROOT_FOLDER,
});

const clearBackupFolder = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = Path.join(path, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        clearBackupFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const uploadFiles = async (folder, files) => {
  if (!process.env.CREDS) {
    console.log("No google service account creds has beed provided.");
  } else {
    await googleDriveInstance.useServiceAccountAuth(
      JSON.parse(process.env.CREDS)
    );

    const createFolderResponse = await googleDriveInstance.createFolder(
      process.env.ROOT_FOLDER,
      folder
    );

    console.log("Uploading to Google Drive");
    await Promise.all(
      files.map((file) =>
        googleDriveInstance.writeFile(
          file.path,
          createFolderResponse.id,
          `${file.name}.json`,
          "application/json"
        )
      )
    );
    console.log("Uploaded");
  }

  clearBackupFolder("backup");
};

exports.uploadFiles = uploadFiles;
