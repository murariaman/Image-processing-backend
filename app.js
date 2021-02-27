const express = require('express')
const expressStatusMonitor = require('express-status-monitor')
const Scraper = require('images-scraper')
const Jimp = require('jimp')
const remove_bg_1 = require("remove.bg")
const download = require('image-downloader')
const multer  = require('multer')
const sizeOf = require('image-size')
const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
const base64Img = require('base64-img');
const app = express();


app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8000);
app.use(expressStatusMonitor());
app.use("/images", express.static(__dirname + '/images'));
app.use("/output", express.static(__dirname + '/output'));
app.use("/bwoutput", express.static(__dirname + '/bwoutput'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/')
  },
  filename: function (req, file, cb) {
    cb(null, 'background.jpg');
  }
})

const upload = multer({ storage: storage })


if (process.env.NODE_ENV === 'development') {
  console.log("ruuning in dev")
  app.use(errorHandler());
} else {
  console.log("Production")
  app.use((err, req, res, next) => {
    res.status(500).send({
      error: 1,
      err,
      message: "Internal Server Error"
    });
  });
}

app.get("/", (req, res) => {
    res.send({
        msg: 'Server Running'
    });
});

app.get("/api/getTextImage", async (req, res) => {
  const {text, limit=10} = req.query;

  let responseData = '';
  const google = new Scraper({
    puppeteer: {
      headless: true,
      args: ["--no-sandbox"]
    }
  });
   
  (async () => {
    const results = await google.scrape(`${text}`, `${limit}`);
    responseData = results;
    res.send({
      responseData
    });
  })();
});

app.get("/api/removeBackgroundFile", (req, res) => {
  const {fileName} = req.query;

  let localFile = `./images/${fileName}`;
  let outputFile = `./images/${fileName}`;

  remove_bg_1.removeBackgroundFromImageFile({
    path: localFile,
    apiKey: "gggVqoJ1KRcxW9CSjVGmyMhS",
    size: "regular",
    type: "auto",
    scale: "50%",
    outputFile: outputFile
  })
    .then((result) => {
      console.log("File saved to " + outputFile);
      let base64img = result.base64img;
      res.send({
        error: 0,
        msg: 'Edited!'
      });
    })
    .catch((errors) => {
      console.log(JSON.stringify(errors));
      res.send({
        error: 1,
        msg: 'ERROR',
        errors
      });
    });

});

app.get("/api/downloadImage", (req, res) => {
  const {imageURL, type, dark=undefined} = req.query;

  // console.log(req.query)

  let color = 0;
  // console.log('dark',dark)
  // console.log('dark', typeof(dark))
  if(dark == 'Dark'){
    color = 100; 
  } else {
    color = 0;
  }

  // console.log(newObjectWidth, newObjectHeight)

  console.log(color)

  if(Number(type) === 1){
    options = {
      url: `${imageURL}`,
      dest: './images/background.jpg'
    }
    // Background Scale
    download.image(options)
    .then(({ filename }) => {
      console.log('Saved to', filename)
      if(Number(color) === Number(100)){
        Jimp.read('./images/background.jpg')
        .then(lenna => {
          // console.log('working')
          return lenna
            .resize(600, 600)
            .quality(80)
            .grayscale()
            .write('./images/background.jpg'); 
        })
        .then(() => {
          // console.log('Called...')
          res.send({
            error: 0,
            msg: 'Downloaded'
          });
        })
        .catch(err => {
          console.error(err);
        });
      } else {
        Jimp.read('./images/background.jpg')
        .then(lenna => {
          // console.log('working')
          return lenna
            .resize(600, 600)
            .quality(80)
            .write('./images/background.jpg'); 
        })
        .then(() => {
          // console.log('Called...')
          res.send({
            error: 0,
            msg: 'Downloaded'
          });
        })
        .catch(err => {
          console.error(err);
        });
      }
    })
  .catch((err) => {
    console.error(err)
    res.send({
      error: 1,
      msg: 'Internal Server Error'
    });
  });
  // Background Scale ends
  } else if(Number(type) === 3) {
    // Second Img processing start
    options = {
      url: `${imageURL}`,
      dest: './images/object2.jpg'
    }
    // Object Scaling
    download.image(options)
    .then(({ filename }) => {
      console.log('Saved to', filename)
      // res.send({
      //   error: 0,
      //   msg: 'Message Saved'
      // });
      Jimp.read('./images/object2.jpg')
      .then(lenna => {
        console.log('working')
        return lenna
          .resize(250, 250)
          // .resize(newObjectWidth, newObjectHeight)
          .quality(80)
          .write('./images/object2.jpg'); 
      })
      .then(() => {
        // console.log('Called...')
        res.send({
          error: 0,
          msg: 'Saved'
        });
      })
      .catch(err => {
        console.error(err);
      });
    })
    .catch((err) => {
      console.error(err)
      res.send({
        error: 1,
        msg: 'Internal Server Error'
      });
    });
    // Object ends here
    // Second Img processing end
  } else {
    options = {
      url: `${imageURL}`,
      dest: './images/object.jpg'
    }
    // Object Scaling
    download.image(options)
    .then(({ filename }) => {
      console.log('Saved to', filename)
      // res.send({
      //   error: 0,
      //   msg: 'Message Saved'
      // });
      Jimp.read('./images/object.jpg')
      .then(lenna => {
        console.log('working')
        return lenna
          .resize(250, 250)
          // .resize(newObjectWidth, newObjectHeight)
          .quality(80)
          .write('./images/object.jpg'); 
      })
      .then(() => {
        // console.log('Called...')
        res.send({
          error: 0,
          msg: 'Saved'
        });
      })
      .catch(err => {
        console.error(err);
      });
    })
    .catch((err) => {
      console.error(err)
      res.send({
        error: 1,
        msg: 'Internal Server Error'
      });
    });
    // Object ends here
  }

});

app.get("/api/getBackgroundSize", (req, res) => {
  sizeOf('images/background.jpg', function (err, dimensions) {
    // console.log(dimensions.width, dimensions.height);
    if(dimensions.width > 0 && dimensions.height > 0){
      res.send({
        error: 0,
        width: dimensions.width,
        height: dimensions.height
      });
    }
  });
});

app.get("/api/combineImages", (req, res) => {
  const {X, Y} = req.query;

  const combineBackend = async(x, y) => {
    const image1 = await Jimp.read('./images/background.jpg'); 
    const image2 = await Jimp.read('./images/object.jpg'); 
    
    // call to blit function  
    let xCor = Number(x);
    let yCor = Number(y);
    image1.blit(image2, xCor, yCor) 
    
    // write image 
    .write('./images/output.png'); 
    console.log('Image Processing Completed'); 
    res.send({
      error: 0,
      msg: 'Images Combined'
    });
  }

  combineBackend(Number(X), Number(Y))
  
});

app.get("/api/combineImages2", (req, res) => {
  const {X, Y, T} = req.query;
  
  let newX = 0;
  let newY = 0;
  if(Number(T) === Number(1)){
    // newX = Number(X) - Number(90);
    newX = Number(X) - Number(90);
    newY = Number(Y) + Number(150);
    // newY = Number(Y) - Number(10);
    console.log('True Called')
  } else {
    newX = Number(X) - Number(80);
    newY = Number(Y) - Number(65);
  }

  // console.log(newX, newY);
  // console.log(X, Y);

  mergeImages([{src: './images/background.jpg'}, {src: './images/object.jpg', x:(newX), y:(newY)}], {
    Canvas: Canvas,
    Image: Image
  })
    .then(b64 => base64Img.img((b64), 'output', 'final', function(err, filepath) {console.log(filepath)}))
    .then(() => {
      console.log('Image Processing Completed'); 
      res.send({
        error: 0,
        msg: 'Images Combined'
      });
    })
    .catch(err => console.log(err));

  // Move The Image
  Jimp.read('./output/final.png')
  .then(lenna => {
    return lenna
      .write('./images/background.jpg'); 
  })

});

// Combine Second Image
app.get("/api/combineImages2Object", (req, res) => {
  const {X, Y, T} = req.query;
  
  let newX = 0;
  let newY = 0;
  if(Number(T) === Number(1)){
    // newX = Number(X) - Number(90);
    newX = Number(X) - Number(90);
    newY = Number(Y) + Number(150);
    // newY = Number(Y) - Number(10);
    console.log('True Called')
  } else {
    newX = Number(X) - Number(80);
    newY = Number(Y) - Number(65);
  }

  // console.log(newX, newY);
  // console.log(X, Y);

  mergeImages([{src: './images/background.jpg'}, {src: './images/object2.jpg', x:(newX), y:(newY)}], {
    Canvas: Canvas,
    Image: Image
  })
    .then(b64 => base64Img.img((b64), 'output', 'final', function(err, filepath) {console.log(filepath)}))
    .then(() => {
      console.log('Image Processing Completed'); 
      res.send({
        error: 0,
        msg: 'Images Combined'
      });
    })
    .catch(err => console.log(err));

  // Move The Image
  Jimp.read('./output/final.png')
  .then(lenna => {
    return lenna
      .write('./images/background.jpg'); 
  })

});

// Add Shape Function
app.get("/api/addCircle", (req, res) => {
  const {X, Y, T} = req.query;
  
  let newX = 0;
  let newY = 0;
  if(Number(T) === Number(1)){
    // newX = Number(X) - Number(90);
    newX = Number(X) - Number(90);
    newY = Number(Y) + Number(150);
    // newY = Number(Y) - Number(10);
    console.log('True Called')
  } else {
    newX = Number(X) - Number(80);
    newY = Number(Y) - Number(65);
  }

  // console.log(newX, newY);
  // console.log(X, Y);

  mergeImages([{src: './images/background.jpg'}, {src: './images/circle.png', x:(newX), y:(newY)}], {
    Canvas: Canvas,
    Image: Image
  })
    .then(b64 => base64Img.img((b64), 'output', 'final', function(err, filepath) {console.log(filepath)}))
    .then(() => {
      console.log('Image Shape Completed'); 
      res.send({
        error: 0,
        msg: 'Images Combined'
      });
    })
    .catch(err => console.log(err));

    // Move The Image
    Jimp.read('./output/final.png')
    .then(lenna => {
      return lenna
        .write('./images/background.jpg'); 
    })
})

app.get("/api/addRectangle", (req, res) => {
  const {X, Y, T} = req.query;
  
  let newX = 0;
  let newY = 0;
  if(Number(T) === Number(1)){
    // newX = Number(X) - Number(90);
    newX = Number(X) - Number(90);
    newY = Number(Y) + Number(150);
    // newY = Number(Y) - Number(10);
    console.log('True Called')
  } else {
    newX = Number(X) - Number(80);
    newY = Number(Y) - Number(65);
  }

  // console.log(newX, newY);
  // console.log(X, Y);

  mergeImages([{src: './images/background.jpg'}, {src: './images/rectangle.png', x:(newX), y:(newY)}], {
    Canvas: Canvas,
    Image: Image
  })
    .then(b64 => base64Img.img((b64), 'output', 'final', function(err, filepath) {console.log(filepath)}))
    .then(() => {
      console.log('Image Shape Completed'); 
      res.send({
        error: 0,
        msg: 'Images Combined'
      });
    })
    .catch(err => console.log(err));

    // Move The Image
    Jimp.read('./output/final.png')
    .then(lenna => {
      return lenna
        .write('./images/background.jpg'); 
    })
})

app.get("/api/getOutputImage", (req, res) => {
  let resultImage = './images/output.png';
  if(resultImage){
    res.send({
      error: 0,
      url: 'http://localhost:8000/images/output.png'
    })
  } else {
    res.send({
      error: 1,
      msg: 'Internal Server Issue'
    });
  }
});

app.post("/api/uploadBackground", upload.single('background'), (req, res) => {
  if(Number(req.file.size) > 0){
    Jimp.read('./images/background.jpg')
      .then(lenna => {
        // console.log('working')
        return lenna
          .resize(600, 600)
          .quality(80)
          .write('./images/background.jpg'); 
      })
      .then(() => {
        // console.log('Called...')
        res.send({
          error: 0,
          msg: 'File uploaded!'
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
});

app.get("/api/makeGrayScaleImage", (req, res) => {

  Jimp.read('./output/final.png')
    .then(newImg => {
      return newImg
        .grayscale()
        .write('./bwoutput/final.png'); 
    })
    .then(() => {
      console.log('Image changed to B&W')
      Jimp.read('./output/final.png')
      .then(newImg => {
        return newImg
          .grayscale()
          .write('./output/final.png'); 
      })
      .then(() => {
        console.log('Image changed to B&W')
        res.send({
          error: 0,
          msg: 'File updated!'
        });
      })
      .catch(err => {
        res.send({
          error: 1,
          err
        });
      });
    })
    .catch(err => {
      res.send({
        error: 1,
        err
      });
    });

});

app.listen(app.get('port'), ()=> {
  console.log('Server Running at PORT', app.get('port'), app.get('host'))
})