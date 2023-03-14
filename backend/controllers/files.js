const mongoose = require("mongoose");
const Papa = require('papaparse');
const fs = require('fs');

//Define a schema for the uploaded data
const uploadSchema = new mongoose.Schema({
  name: String,
  file: {
    data: Buffer,
    contentType: String,
    originalName: String,
    columns: [String]
  },
});


// Create a model based on the schema
const Upload = mongoose.model('Upload', uploadSchema);
const readCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    });
  });
};
const fileHandler = async (req, res) => {
  console.log(req.files)

  const n = req.files.length;

  for (let i = 0; i < n; i++) {
    let name = req.files[i].filename;
    let file = req.files[i];

    let csv = await readCSVFile(`uploads/${name}`);
    let results = Papa.parse(csv, { header: true });
    let columns = results.meta.fields;

    const upload = new Upload({
      name,
      file: {
        data: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname,
        columns
      },
    });
    try {
      await upload.save();      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error uploading file' });
    }
    
  }
  return res.json({ success: true });
};


module.exports = { fileHandler };


