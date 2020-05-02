// import npm
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const Fuse = require('fuse.js')
const checkAuth = require('./middleware/check-auth');
const multer = require("multer")
const crypto = require("crypto")
// const upload = multer({ dest: 'images/' })
const path = require("path");
const
  {
    sendPasswordResetEmail,
    sendCaregiverAcceptEmail,
    sendCaregiverRejectionEmail,
    sendCaregiverWelcomeEmail,
    sendCaregiverUpdateEmail,
    sendElderWelcomeEmail,
    sendElderUpdateEmail,
    sendRequestReceivedEmail,
  } = require('./email/email')


// connect to database
mongoose
  .connect(
    "mongodb+srv://admin:Ve6VxyxV3NotCGdZ@cluster0-douoa.azure.mongodb.net/test-database?retryWrites=true&w=majority",
    { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true }
    // { useNewUrlParser: true },
    // { useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((error) => {
    console.log("Connection failed!");
    console.log(error);
  });

// import model
const Elder = require('./model/elderModel')
const Caregiver = require('./model/caregiverModel')
const Request = require('./model/requestModel')
const Schedule = require('./model/scheduleModel')
const User = require('./model/userModel')
const AuthUser = require('./model/authUserModel')
const History = require('./model/historyModel')
const imagePath = require('./model/imagePathModel')
const Service = require('./model/serviceModel')
const Rejection = require('./model/rejectionModel')
// const AngSchedule = require('./model/angScheduleModel')
const CertificatePath = require('./model/certificateModel')
const Messages = require('./model/messagesModel')

const upload = multer({
  dest: 'images/'
})

const certificates = multer({
  dest: 'certificates/'
})

// express app
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/certificates", express.static(path.join(__dirname, "certificates")));
app.use("/", express.static(path.join(__dirname, "angular")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, "angular", "index.html"));
// });

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // const isValid = true;
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    console.log(file.mimetype);
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

const newStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // const isValid = true;
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    console.log(file.mimetype);
    if (isValid) {
      error = null;
    }
    cb(error, "certificates");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

// messages
app.post('/api/messages', (req, res, next) => {
  const messages = new Messages({
    elder: req.body.elder,
    caregiver: req.body.caregiver,
    messages: req.body.messages
  });
  console.log(path);
  messages
    .save()
    .then(response => {
      res.status(201).json({
        message: "file saved successfully"
      });
    });
})

app.patch('/api/messages', (req, res, next) => {
  const messages = new Messages({
    elder: req.body.elder,
    caregiver: req.body.caregiver,
    messages: req.body.messages
  });
  console.log(path);
  Messages.findOneAndUpdate({ $and: [{ elder: messages.elder }, { caregiver: messages.caregiver }] }, { $set: { messages: messages.messages } }).then(result => {
    res.status(200).json({ message: "Update successful!" });
  });
})

app.get("/api/messages", (req, res, next) => {
  Messages.find().then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

app.get("/api/messages/:elder&:caregiver", (req, res, next) => {
  const elder = req.params.elder;
  const caregiver = req.params.caregiver;
  console.log(elder, caregiver);
  Messages.find({ $and: [{ elder: elder }, { caregiver: caregiver }] }).then(document => {
    // res.status(200).json({
    //   message: "Fetched successfully!",
    //   user: document
    // });
    res.status(200).json(document);
    console.log(document)
  });
});



app.post('/api/upload', multer({ storage: storage }).single('upload'), (req, res) => {
  const url = req.protocol + "://" + req.get("host");
  console.log('this ran')
  const path = new imagePath({
    email: req.body.email,
    path: url + '/images/' + req.file.filename
  });
  console.log(path);
  path
    .save()
    .then(response => {
      res.status(201).json({
        message: "image saved successfully"
      });
    });
})


app.post('/api/certificates', multer({ storage: newStorage }).single('certificate'), (req, res) => {
  const url = req.protocol + "://" + req.get("host");
  console.log('this ran')
  const path = new CertificatePath({
    email: req.body.email,
    path: url + '/certificates/' + req.file.filename
  });
  console.log(path);
  path
    .save()
    .then(response => {
      res.status(201).json({
        message: "file saved successfully"
      });
    });
  Caregiver.findOneAndUpdate({ email: path.email }, { $set: { certificate: path.path } }).then(result => {
    res.status(200).json({ message: "Update successful!" });
  });
})

app.get("/api/upload/:email", (req, res, next) => {
  imagePath.findOne({ email: req.params.email }).then(document => {
    // res.status(200).json({
    //   message: "Fetched successfully!",
    //   user: document
    // });
    res.status(200).json(document);
    console.log(document)
  });
});

app.get("/api/upload/certificate/:email", (req, res, next) => {
  CertificatePath.findOne({ email: req.params.email }).then(document => {
    // res.status(200).json({
    //   message: "Fetched successfully!",
    //   user: document
    // });
    res.status(200).json(document);
    console.log(document)
  });
});

app.patch("/api/upload/:email", multer({ storage: storage }).single('upload'), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const path = url + '/images/' + req.file.filename
  // const path = new imagePath({
  //   email: req.body.email,
  //   path: url + '/images/' + req.file.filename
  // });
  console.log(path);
  imagePath.findOneAndUpdate({ email: req.params.email }, { $set: { path: path } }).then(result => {
    console.log(result);
    res.status(200).json({ message: "Update successful!", path: path });
  });
});

app.patch("/api/certificates/:email", multer({ storage: newStorage }).single('certificate'), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const path = url + '/certificates/' + req.file.filename
  // const path = new imagePath({
  //   email: req.body.email,
  //   path: url + '/images/' + req.file.filename
  // });
  console.log(path);
  CertificatePath.findOneAndUpdate({ email: req.params.email }, { $set: { path: path } }).then(result => {
    console.log(result);
    res.status(200).json({ message: "Update successful!" });
  });
  Caregiver.findOneAndUpdate({ email: req.params.email }, { $set: { certificate: path } }).then(result => {
    res.status(200).json({ message: "Update successful!" });
  });

});

// add rejections
app.post("/api/rejections", (req, res, next) => {
  const rejection = new Rejection({
    caregiverEmail: req.body.caregiverEmail,
    caregiverName: req.body.caregiverName,
    reason: req.body.reason
  });
  // save caregiver
  rejection
    .save()
    .then(rejection => {
      res.status(201).json({
        message: "user saved successfully",
        rejection: rejection
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
  sendCaregiverRejectionEmail(rejection.caregiverEmail, rejection.caregiverName, rejection.reason)
});

// update rejections
app.patch("/api/rejections", (req, res, next) => {
  const rejection = new Rejection({
    caregiverEmail: req.body.caregiverEmail,
    caregiverName: req.body.caregiverName,
    reason: req.body.reason
  });
  Rejection.findOneAndUpdate({ caregiverEmail: rejection.caregiverEmail }, { $set: { reason: rejection.reason } }).then(result => {
    res.status(200).json({ message: "Update successful!", availability: schedule.availability });
  });
  sendCaregiverRejectionEmail(rejection.caregiverEmail, rejection.caregiverName, rejection.reason)
});

// get rejections
app.get("/api/rejections", (req, res, next) => {
  Rejection.find().then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// get rejection
app.get("/api/rejections/:email", (req, res, next) => {
  Rejection.findOne({ caregiverEmail: req.params.email }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// add services
app.post("/api/services", (req, res, next) => {
  const services = new Service({
    dailyCare: req.body.dailyCare,
    specialCare: req.body.specialCare
  });
  // save caregiver
  services
    .save()
    .then(rejection => {
      res.status(201).json({
        message: "user saved successfully",
        rejection: rejection
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// get services
app.get("/api/services", (req, res, next) => {
  Service.find().then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

app.get("/api/services/:id", (req, res, next) => {
  Service.findOne({ _id: req.params.id }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// get rejection
app.patch("/api/services/:id", (req, res, next) => {
  const service = {
    dailyCare: req.body.dailyCare,
    specialCare: req.body.specialCare
  }
  Service.findOneAndUpdate({ _id: req.params.id }, { $set: { dailyCare: service.dailyCare, specialCare: service.specialCare } }).then(result => {
    res.status(200).json({ message: "Update successful!", availability: schedule.availability });
  });
});



// add caregivers
app.post("/api/caregivers", (req, res, next) => {
  let path;
  imagePath.findOne({ email: req.body.email }).then(document => {
    console.log(document);
    path = document.path;
    console.log('path is ' + path);
    // create caregiver model
    const caregiver = new Caregiver({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      birthDate: req.body.birthDate,
      gender: req.body.gender,
      houseNumber: req.body.houseNumber,
      street: req.body.street,
      subDistrict: req.body.subDistrict,
      district: req.body.district,
      province: req.body.province,
      postalCode: req.body.postalCode,
      phoneNumber: req.body.phoneNumber,
      services: req.body.services,
      certificate: req.body.certificate,
      experience: req.body.experience,
      dailyPrice: req.body.dailyPrice,
      monthlyPrice: req.body.monthlyPrice,
      imagePath: path,
      schedule: req.body.schedule,
      approval: req.body.approval
    });
    // save caregiver
    caregiver
      .save()
      .then(createdCaregiver => {
        res.status(201).json({
          message: "user saved successfully",
          caregiver: createdCaregiver
        });
        console.log('new caregiver created')
        console.log(createdCaregiver)
        // sendWelcomeEmail(caregiver.email, caregiver.name);
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
    sendCaregiverWelcomeEmail(caregiver.email, caregiver.name)
  });
});
// get caregivers
app.get("/api/caregivers", (req, res, next) => {
  Caregiver.find({ approval: true }).then(documents => {
    res.status(200).json({
      message: 'fetched successfully',
      users: documents
    });
    console.log(documents)
  });
});

// get caregivers
app.get("/api/u-caregivers", (req, res, next) => {
  Caregiver.find({ approval: null }).then(documents => {
    res.status(200).json({
      message: 'fetched successfully',
      users: documents
    });
    console.log(documents)
  });
});

app.get("/api/allcg", (req, res, next) => {
  // Caregiver.countDocuments(function (err, count) {
  //   console.log('there are %d jungle adventures', count);
  // });
  Caregiver.countDocuments({ approval: true }).then(count => {
    res.status(200).json({
      count
    });
    console.log('the number of caregivers is ' + count);
  });
});

app.get("/api/alle", (req, res, next) => {
  // Caregiver.countDocuments(function (err, count) {
  //   console.log('there are %d jungle adventures', count);
  // });
  Elder.countDocuments().then(count => {
    res.status(200).json({
      count
    });
    console.log('the number of elders is ' + count);
  });
});

app.get("/api/caregivers/:email", (req, res, next) => {
  Caregiver.findOne({ email: req.params.email }).then(document => {
    // res.status(200).json({
    //   message: "Fetched successfully!",
    //   user: document
    // });
    res.status(200).json(document);
    console.log(document)
  });
});

// app.get("/api/caregivers", (req, res, next) => {
//   const postalCode = req.query.postalCode
//   Caregiver.find().then(documents => {
//     var options = {
//       keys: ['postalCode'],
//     };
//     var fuse = new Fuse(documents, options)

//     var result = fuse.search(postalCode)
//     res.status(200).json({
//       message: 'fetched successfully',
//       users: result
//     });
//     console.log('searching for code ' + postalCode)
//     console.log(result)
//   });
// });

app.get("/api/caregivers/:postalCode", (req, res, next) => {
  const postalCode = req.params.postalCode;
  console.log('finding ' + postalCode)
  Caregiver.find({ postalCode: postalCode }).then(documents => {
    res.status(200).json({
      message: 'users with' + postalCode,
      users: documents
    });
    console.log(documents)
  });
});

// update caregivers
app.patch("/api/caregivers/:email", (req, res, next) => {
  let path;
  imagePath.findOne({ email: req.body.email }).then(document => {
    console.log(document);
    path = document.path;
    console.log('path is ' + path);
    const caregiver = new Caregiver({
      _id: req.body._id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      birthDate: req.body.birthDate,
      gender: req.body.gender,
      houseNumber: req.body.houseNumber,
      street: req.body.street,
      subDistrict: req.body.subDistrict,
      district: req.body.district,
      province: req.body.province,
      postalCode: req.body.postalCode,
      phoneNumber: req.body.phoneNumber,
      services: req.body.services,
      certificate: req.body.certificate,
      experience: req.body.experience,
      dailyPrice: req.body.dailyPrice,
      monthlyPrice: req.body.monthlyPrice,
      imagePath: path,
      schedule: req.body.availability,
      approval: req.body.approval
    });
    Caregiver.updateOne({ email: req.params.email }, caregiver).then(result => {
      res.status(200).json({ message: "Update successful!" });
    });
    sendCaregiverUpdateEmail(caregiver.email, caregiver.name);
    console.log(req.body.newCg)
    if (req.body.newCg === true) {
      sendCaregiverAcceptEmail(caregiver.email, caregiver.name);
    }
    console.log('new caregiver');
    console.log(caregiver);
    // sendUpdateEmail(caregiver.email, caregiver.name);
  });
});



// add schedule
app.post("/api/schedules", (req, res, next) => {
  // create schedule model
  const schedule = new Schedule({
    caregiverEmail: req.body.caregiverEmail,
    availability: req.body.availability
  });
  // save caregiver
  schedule
    .save()
    .then(createdSchedule => {
      res.status(201).json({
        message: "user saved successfully",
        schedule: createdSchedule,
        belongTo: createdSchedule.caregiverEmail
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});
// get schedule
app.get("/api/schedules", (req, res, next) => {
  Schedule.find().then(documents => {
    res.status(200).json({
      message: "Fetched successfully!",
      users: documents
    });
    console.log(documents)
  });
});
// update schedule
app.patch("/api/schedules/:email", (req, res, next) => {
  const schedule = new Schedule({
    _id: req.body._id,
    caregiverEmail: req.body.caregiverEmail,
    availability: req.body.availability
  });
  Schedule.updateOne({ caregiverEmail: req.params.email }, schedule).then(result => {
    res.status(200).json({ message: "Update successful!", newSchedule: result });
  });
  console.log('update ran')
  Caregiver.findOneAndUpdate({ email: req.params.email }, { $set: { schedule: schedule.availability } }).then(result => {
    res.status(200).json({ message: "Update successful!", availability: schedule.availability });
  });
  console.log('caregiver updated')
});
app.patch("/api/experiences", (req, res, next) => {
  const data = {
    email: req.body.email,
    experiences: req.body.experiences
  };
  console.log(data);
  Caregiver.findOneAndUpdate({ email: data.email }, { $set: { experience: data.experiences } }).then(result => {
    res.status(200).json({ message: "Update successful!" });
  });
  console.log('caregiver updated')
});

// get one schedule
app.get("/api/schedules/:email", (req, res, next) => {
  Schedule.findOne({ caregiverEmail: req.params.email }).then(document => {
    // res.status(200).json({
    //   message: "Fetched successfully!",
    //   user: document
    // });
    res.status(200).json(document);
    console.log(document)
    console.log('get ran')
  });
});

app.post("/api/profiles", multer({ storage: storage }).single('profilepic'), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const file = req.file;
  // console.log(file.filename);
  const image = url + "/images/" + req.file

  console.log(image)
  console.log(url)
});


// add elders
// app.post("/api/elders", multer({ storage: storage }).single("image"), (req, res, next) => {
app.post("/api/elders", (req, res, next) => {
  let path;
  imagePath.findOne({ email: req.body.email }).then(document => {
    console.log(document);
    path = document.path;
    console.log('path is ' + path);

    // create elder model
    const elder = new Elder({
      name: req.body.name,
      email: req.body.email,
      birthDate: req.body.birthDate,
      gender: req.body.gender,
      houseNumber: req.body.houseNumber,
      street: req.body.street,
      subDistrict: req.body.subDistrict,
      district: req.body.district,
      province: req.body.province,
      postalCode: req.body.postalCode,
      phoneNumber: req.body.phoneNumber,
      imagePath: path
    });
    console.log(elder);
    elder
      .save()
      .then(createdElder => {
        res.status(201).json({
          message: "User saved successfully",
          elder: createdElder
        })
        sendWelcomeEmail(elder.email, elder.name);
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
    sendElderWelcomeEmail(elder.email, elder.name)
  });
});
// get elders
app.get("/api/elders/", (req, res, next) => {
  Elder.find().then(documents => {
    res.status(200).json({
      message: "Fetched successfully!",
      users: documents,
    });
    console.log(documents)
  });
});
// get one elder
// app.get("/api/elders/:id", (req, res, next) => {
//   Elder.findOne({_id: req.params.id}).then(document => {
//     res.status(200).json({
//       message: "Fetched successfully!",
//       users: document,
//       id: document._id,
//       name: document.name,
//       gender: document.gender,
//     });
//     console.log(documents)
//   });
// });

app.get("/api/elders/:email", (req, res, next) => {
  Elder.findOne({ email: req.params.email }).then(document => {
    // res.status(200).json({
    //   message: "Fetched successfully!",
    //   user: document
    // });
    res.status(200).json(document);
    console.log(document)
  });
});
// update elders
app.patch("/api/elders/:email", (req, res, next) => {
  let path;
  imagePath.findOne({ email: req.body.email }).then(document => {
    console.log(document);
    path = document.path;
    console.log('path is ' + path);
    const elder = new Elder({
      _id: req.body._id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      birthDate: req.body.birthDate,
      gender: req.body.gender,
      houseNumber: req.body.houseNumber,
      street: req.body.street,
      subDistrict: req.body.subDistrict,
      district: req.body.district,
      province: req.body.province,
      postalCode: req.body.postalCode,
      phoneNumber: req.body.phoneNumber,
      imagePath: path
    });
    Elder.updateOne({ email: req.params.email }, elder).then(result => {
      res.status(200).json({ message: "Update successful!", elder: elder });
    });
    sendElderUpdateEmail(elder.email, elder.name);
    // sendUpdateEmail(elder.email, elder.name);
    // Elder.updateOne({ _id: req.params.id }, elder).then(result => {
    //   res.status(200).json({ message: "Update successful!" });
    // });
  });
});

app.post("/api/history", (req, res, next) => {
  const history = new History({
    caregiverName: req.body.caregiverName,
    caregiverEmail: req.body.caregiverEmail,
    elderName: req.body.elderName,
    elderEmail: req.body.elderEmail,
    startDate: req.body.startDate,
    stopDate: req.body.stopDate,
    requireInterview: req.body.requireInterview,
    rating: req.body.rating,
    review: req.body.review,
    selectedServices: req.body.selectedServices,
    selectedDP: req.body.selectedDP,
    selectedMP: req.body.selectedMP
  });
  console.log('logging history')
  console.log(history);
  history.save().then(created => {
    res.status(201).json({
      message: "history saved successfully."
    });
  });
});

app.get("/api/requests/:email", (req, res, next) => {
  // Request.find({ caregiverEmail: req.params.email }).then(document => {
  Request.find({ $or: [{ caregiverEmail: req.params.email }, { elderEmail: req.params.email }], status: null }).then(document => {
    // res.status(200).json({
    //   message: "Fetched successfully!",
    //   user: document
    // });
    res.status(200).json(document);
    console.log(document)
  });
});

app.get("/api/requests-status/:email", (req, res, next) => {
  // Request.find({ caregiverEmail: req.params.email }).then(document => {
  Request.find({ $or: [{ caregiverEmail: req.params.email }, { elderEmail: req.params.email }] }).then(document => {
    // res.status(200).json({
    //   message: "Fetched successfully!",
    //   user: document
    // });
    res.status(200).json(document);
    console.log(document)
  });
});

app.get("/api/history", (req, res, next) => {
  History.find().then(documents => {
    res.status(200).json({
      message: "Fetched successfully!",
      history: documents,
    });
  });
});

app.get("/api/history/:email", (req, res, next) => {
  History.find({ $or: [{ caregiverEmail: req.params.email }, { elderEmail: req.params.email }] }).then(document => {
    // res.status(200).json({
    //   message: "Fetched successfully!",
    //   user: document
    // });
    res.status(200).json(document);
    console.log(document)
  });
});

app.patch("/api/requests/:id", (req, res, next) => {
  const id = req.body._id;
  console.log(id);
  const request = new Request({
    _id: req.body._id,
    status: req.body.status,
    rejectionReason: req.body.rejectionReason
  });
  Request.findByIdAndUpdate(id, { $set: { status: req.body.status, rejectionReason: req.body.rejectionReason } }).then(result => {
    // Request.updateOne({ _id: req.body._id }, request).then(result => {
    res.status(200).json({ message: "Update successful!" });
    console.log('updated')
    console.log(request);
  });
});

app.delete("/api/requests/:id", (req, res, next) => {
  const id = req.params.id;
  console.log(id)
  Request.findByIdAndRemove(id).then(result => {
    res.status(200).json({ message: "Delete successful" })
  });
});

app.patch("/api/history/:id", (req, res, next) => {
  const id = req.body._id;
  console.log(id);
  const history = new History({
    rating: req.body.rating,
    review: req.body.review
  });
  History.findByIdAndUpdate(id, { $set: { rating: history.rating, review: history.review } }).then(result => {
    // Request.updateOne({ _id: req.body._id }, request).then(result => {
    res.status(200).json({ message: "Update successful!" });
    console.log('updated')
    console.log(history);
  });
});

// add users
app.post("/api/users", (req, res, next) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  console.log(user);
  user.save().then(createdUser => {
    res.status(201).json({
      message: "user saved successfully",
      userId: createdUser._id
    });
  });
});
// get users
app.get("/api/users", (req, res, next) => {
  User.find().then(documents => {
    res.status(200).json({
      message: "Fetched successfully!",
      users: documents,
    });
    console.log(documents)
  });
});
// update users
app.put("/api/users/:id", (req, res, next) => {
  const user = new User({
    _id: req.body._id,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });
  User.updateOne({ _id: req.params.id }, user).then(result => {
    res.status(200).json({ message: "Update successful!" });
  });
});

app.get("/api/users/:id", (req, res, next) => {
  User.findById(req.params.id).then(user => {
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// For Auth
app.get("/api/authusers", (req, res, next) => {
  AuthUser.find().then(documents => {
    res.status(200).json({
      message: "Fetched successfully",
      users: documents
    });
  })
})

// find one user based on password reset token
app.get("/api/authusers/:token", (req, res, next) => {
  const token =  crypto
  .createHash('sha256')
  .update(req.params.token)
  .digest('hex');
  AuthUser.findOne({ passwordResetToken: token }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
})

app.post("/api/authusers/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const authUser = new AuthUser({
      email: req.body.email,
      password: hash
    });
    authUser
      .save()
      .then(result => {
        res.status(201).json({
          message: "User created!",
          result: result
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
});

app.post("/api/authusers/login", (req, res, next) => {
  let fetchedUser;
  AuthUser.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed, user does not exist."
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed, password does not match.",
          password: user.password
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        "secret_this_should_be_longer",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: "Auth failed, error other than user or password.",
        fetchedUser: fetchedUser,
        // user: user
      });
    });
});

app.post("/api/authusers/forgotPassword", (req, res, next) => {
  // 1) Get user based on POSTed email

  // let user = new AuthUser();

  AuthUser.findOne({ email: req.body.email }, function (err, returnedUser) {
    console.log(returnedUser);
    // if(!user){
    //     console.log("No user exists");
    // }
    // if (req.body.password === req.body.confirm){
    //       returneduser.setPassword(req.body.password, function(err) {
    //           returneduser.save(function(err){
    //               console.log(err);
    //               res.redirect("/adminuser");
    //           });
    //       });
    // } else {
    //    console.log("Passwords do not match")       ;
    //    res.redirect("/adminuser");
    // }

    // 2) Generate the random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    returnedUser.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    console.log(returnedUser.passwordResetToken);
    returnedUser.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    // user.markModified("passwordResetToken");
    returnedUser.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    // const resetURL = `${req.protocol}://${req.get(
    //   'host'
    // )}/api/authusers/resetPassword/${resetToken}`;
    const resetURL =  `http://localhost:4200/reset-password/${resetToken}`;
    console.log(resetURL)

    sendPasswordResetEmail(returnedUser.email, returnedUser.name, resetURL);

    // try {
    //   // sendEmail({
    //   //   email: user.email,
    //   //   subject: 'Your password reset token (valid for 10 min)',
    //   //   message
    //   // });
  
    //   sendPasswordResetEmail(returnedUser.email, returnedUser.name, resetURL);
  
    //   res.status(200).json({
    //     status: 'success',
    //     message: 'Token sent to email!'
    //   });
    // } catch (err) {
    //   returnedUser.passwordResetToken = undefined;
    //   returnedUser.passwordResetExpires = undefined;
    //   returnedUser.save({ validateBeforeSave: false });

    // }
  });
  // const user = null;
  // console.log(req.body.email);
  // AuthUser.findOne({ email: req.body.email }).then(doc => {
  //   user = doc;
  //   console.log(user);
  // })
  // const resetToken = user.createPasswordResetToken();
  // user.save({ validateBeforeSave: false });
  // console.log(user);
  // if (!user) {
  //   return next(new AppError('There is no user with email address.', 404));
  // }

  // 2) Generate the random reset token
  // const resetToken = crypto.randomBytes(32).toString('hex');

  // user.passwordResetToken = crypto
  //   .createHash('sha256')
  //   .update(resetToken)
  //   .digest('hex');
  // user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // // user.markModified("passwordResetToken");
  // user.save({ validateBeforeSave: false }).then(createdUser => {
  //   res.status(201).json({
  //     message: "user saved successfully",
  //     userId: createdUser._id
  //   });
  // });


  // 3) Send it to user's email
  // const resetURL = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/authusers/resetPassword/${resetToken}`;


  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  // try {
  //   // sendEmail({
  //   //   email: user.email,
  //   //   subject: 'Your password reset token (valid for 10 min)',
  //   //   message
  //   // });

  //   sendPasswordResetEmail(user.email, user.name, resetURL);

  //   res.status(200).json({
  //     status: 'success',
  //     message: 'Token sent to email!'
  //   });
  // } catch (err) {
  //   user.passwordResetToken = undefined;
  //   user.passwordResetExpires = undefined;
  //   user.save({ validateBeforeSave: false });

  //   // return next(
  //   //   new AppError('There was an error sending the email. Try again later!'),
  //   //   500
  //   // );
  // }
});

app.patch("/api/authusers/resetPassword/:token", (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
    console.log(req.params.token, hashedToken);

  AuthUser.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }, function(err, user) {
    // if (!user) {
    //   return next(new AppError('Token is invalid or has expired', 400));
    // }
    console.log(user);
    bcrypt.hash(req.body.password, 10).then(hash => {
      user.password = hash;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.save();
    });
  });
  // console.log(user);

  // 2) If token has not expired, and there is user, set the new password
  // if (!user) {
  //   return next(new AppError('Token is invalid or has expired', 400));
  // }
  // user.password = req.body.password;
  // user.passwordResetToken = undefined;
  // user.passwordResetExpires = undefined;
  // user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  // createSendToken(user, 200, res);
});

// app.post("/api/authusers/:email", (req, res, next) => {
//   // 1) Get user from collection
//   const user = User.findById(req.user.id).select('+password');

//   // 2) Check if POSTed current password is correct
//   if (!(user.correctPassword(req.body.passwordCurrent, user.password))) {
//     return next(new AppError('Your current password is wrong.', 401));
//   }

//   // 3) If so, update password
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.save();
//   // User.findByIdAndUpdate will NOT work as intended!

//   // 4) Log user in, send JWT
//   createSendToken(user, 200, res);
// });


// requests
app.post("/api/requests", (req, res, next) => {
  const request = new Request({
    elderEmail: req.body.elderEmail,
    elderName: req.body.elderName,
    caregiverEmail: req.body.caregiverEmail,
    caregiverName: req.body.caregiverName,
    startDate: req.body.startDate,
    stopDate: req.body.stopDate,
    status: req.body.status,
    requireInterview: req.body.requireInterview,
    rejectionReason: req.body.rejectionReason,
    dateSent: req.body.dateSent,
    selectedServices: req.body.selectedServices,
    selectedDP: req.body.selectedDP,
    selectedMP: req.body.selectedMP
  });
  console.log(request);
  const startDate = `${request.startDate.getDate()}/${request.startDate.getMonth() + 1}/${request.startDate.getFullYear()}`;
  const stopDate = `${request.stopDate.getDate()}/${request.stopDate.getMonth() + 1}/${request.stopDate.getFullYear()}`;
  const totalDays = Math.trunc((request.stopDate.getTime() - request.startDate.getTime()) / 86400000);
  sendRequestReceivedEmail(
    request.caregiverEmail,
    request.caregiverName,
    request.elderEmail,
    request.elderName,
    0,
    0,
    request.selectedServices.dailyCare,
    request.selectedServices.specialCare,
    startDate,
    stopDate,
    request.requireInterview,
    totalDays
  )
  request.save().then(createdRequest => {
    res.status(201).json({
      message: "request saved successfully",
      request: createdRequest
    });
  });
});

// get requests
app.get("/api/requests", (req, res, next) => {
  Request.find().then(documents => {
    res.status(200).json({
      message: 'fetched successfully',
      users: documents
    });
    console.log(documents)
  });
});

// export app
module.exports = app;

