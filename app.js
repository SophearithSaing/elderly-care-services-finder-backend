// import npm
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const checkAuth = require('./middleware/check-auth');
const multer = require("multer");
const crypto = require("crypto");
const dotenv = require('dotenv');
dotenv.config({
  path: './process.env',
});
// const upload = multer({ dest: 'images/' })
const path = require("path");
const
  {
    sendPasswordResetEmail,
    sendPasswordResetConfirmEmail,
    sendElderWelcomeEmail,
    sendCaregiverWelcomeEmail,
    sendCaregiverAcceptEmail,
    sendCaregiverRejectionEmail,
    sendElderUpdateEmail,
    sendCaregiverUpdateEmail,
    sendRequestEmail,
    sendRequestResponseEmail,
    sendUpdateServicesEmail
  } = require('./email/email')


// connect to database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(
    DB,
    {
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((error) => {
    console.log("Connection failed!");
    console.log(error);
  });

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useUnifiedTopology', true);

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

// upload image to 'upload'
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

// upload certificate
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
    res.status(200).json(document);
    console.log(document)
  });
});

app.get("/api/upload/certificate/:email", (req, res, next) => {
  CertificatePath.findOne({ email: req.params.email }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

app.patch("/api/upload/:email", multer({ storage: storage }).single('upload'), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const path = url + '/images/' + req.file.filename
  console.log(path);
  imagePath.findOneAndUpdate({ email: req.params.email }, { $set: { path: path } }).then(result => {
    console.log(result);
    res.status(200).json({ message: "Update successful!", path: path });
  });
});

app.patch("/api/certificates/:email", multer({ storage: newStorage }).single('certificate'), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const path = url + '/certificates/' + req.file.filename
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
  // save rejections
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
  Caregiver.findOne({ email: rejection.caregiverEmail }).then(document => {
    const birthYear = new Date(document.birthDate).getFullYear();
    const year = new Date().getFullYear();
    document.age = year - birthYear;
    sendCaregiverRejectionEmail(
      document.email,
      document.name,
      rejection.reason,
      document.age,
      document.phoneNumber,
      document.services.dailyCare,
      document.services.specialCare,
      document.dailyPrice,
      document.monthlyPrice
    );
  });
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
  Caregiver.findOne({ email: rejection.caregiverEmail }).then(document => {
    const birthYear = new Date(document.birthDate).getFullYear();
    const year = new Date().getFullYear();
    document.age = year - birthYear;
    sendCaregiverRejectionEmail(
      document.email,
      document.name,
      rejection.reason,
      document.age,
      document.phoneNumber,
      document.services.dailyCare,
      document.services.specialCare,
      document.dailyPrice,
      document.monthlyPrice
    );
  });
});

// get all rejections
app.get("/api/rejections", (req, res, next) => {
  Rejection.find().then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// get one rejection
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

// get all services
app.get("/api/services", (req, res, next) => {
  Service.find().then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// get one service
app.get("/api/services/:id", (req, res, next) => {
  Service.findOne({ _id: req.params.id }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// update one services
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
  const now = new Date();
  let path;
  imagePath.findOne({ email: req.body.email }).then(document => {
    console.log(document);
    if (document === null) {
      path = '';
    } else {
      path = document.path;
    }
    console.log('path is ' + path);
    // create caregiver model
    const caregiver = new Caregiver({
      joinedDate: now,
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
      .then(document => {
        res.status(201).json({
          message: "user saved successfully",
          caregiver: document
        });
        console.log('new caregiver created')
        console.log(document)
        const birthYear = new Date(document.birthDate).getFullYear();
        const year = new Date().getFullYear();
        document.age = year - birthYear;
        sendCaregiverWelcomeEmail(
          document.email,
          document.name,
          rejection.reason,
          document.age,
          document.phoneNumber,
          document.services.dailyCare,
          document.services.specialCare,
          document.dailyPrice,
          document.monthlyPrice
        );
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
});

// get approved caregivers
app.get("/api/caregivers", (req, res, next) => {
  Caregiver.find({ approval: true }).then(documents => {
    res.status(200).json({
      message: 'fetched successfully',
      users: documents
    });
    console.log(documents)
  });
});

// get unapproved caregivers
app.get("/api/u-caregivers", (req, res, next) => {
  Caregiver.find({ approval: null }).then(documents => {
    res.status(200).json({
      message: 'fetched successfully',
      users: documents
    });
    console.log(documents)
  });
});

// get one caregiver
app.get("/api/caregivers/:email", (req, res, next) => {
  Caregiver.findOne({ email: req.params.email }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// get one caregiver
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

// count all approved caregivers
app.get("/api/allcg", (req, res, next) => {
  Caregiver.countDocuments({ approval: true }).then(count => {
    res.status(200).json({
      count
    });
    console.log('the number of caregivers is ' + count);
  });
});

// count all elders
app.get("/api/alle", (req, res, next) => {
  Elder.countDocuments().then(count => {
    res.status(200).json({
      count
    });
    console.log('the number of elders is ' + count);
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
    Caregiver.findOne({ email: req.params.email }).then(document => {
      const birthYear = new Date(document.birthDate).getFullYear();
      const year = new Date().getFullYear();
      document.age = year - birthYear;
      sendCaregiverWelcomeEmail(
        document.email,
        document.name,
        document.age,
        document.phoneNumber,
        document.services.dailyCare,
        document.services.specialCare,
        document.dailyPrice,
        document.monthlyPrice
      )
    });
    Caregiver.updateOne({ email: req.params.email }, caregiver).then(result => {
      res.status(200).json({ message: "Update successful!" });
    });
    sendCaregiverUpdateEmail(caregiver.email, caregiver.name);
    console.log(req.body.newCg)
    if (req.body.newCg === true) {
      Caregiver.findOne({ email: req.params.email }).then(document => {
        const birthYear = new Date(document.birthDate).getFullYear();
        const year = new Date().getFullYear();
        document.age = year - birthYear;
        sendCaregiverAcceptEmail(
          document.email,
          document.name,
          document.age,
          document.phoneNumber,
          document.services.dailyCare,
          document.services.specialCare,
          document.dailyPrice,
          document.monthlyPrice
        )
      });
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
    res.status(200).json(document);
    console.log(document)
    console.log('get ran')
  });
});

// add elders
app.post("/api/elders", (req, res, next) => {
  const now = new Date();
  let path;
  imagePath.findOne({ email: req.body.email }).then(document => {
    console.log(document);
    path = document.path;
    console.log('path is ' + path);
    // create elder model
    const elder = new Elder({
      joinedDate: now,
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

// get all elders
app.get("/api/elders/", (req, res, next) => {
  Elder.find().then(documents => {
    res.status(200).json({
      message: "Fetched successfully!",
      users: documents,
    });
    console.log(documents)
  });
});

// get one elders
app.get("/api/elders/:email", (req, res, next) => {
  Elder.findOne({ email: req.params.email }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// update elder
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
  });
});

// add history
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

// get all histories
app.get("/api/history", (req, res, next) => {
  History.find().then(documents => {
    res.status(200).json({
      message: "Fetched successfully!",
      history: documents,
    });
  });
});

// get one history
app.get("/api/history/:email", (req, res, next) => {
  History.find({ $or: [{ caregiverEmail: req.params.email }, { elderEmail: req.params.email }] }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// update history
app.patch("/api/history/:id", (req, res, next) => {
  const id = req.body._id;
  console.log(id);
  const history = new History({
    rating: req.body.rating,
    review: req.body.review
  });
  History.findByIdAndUpdate(id, { $set: { rating: history.rating, review: history.review } }).then(result => {
    res.status(200).json({ message: "Update successful!" });
    console.log('updated')
    console.log(history);
  });
});

// add request
app.post("/api/requests", (req, res, next) => {
  const request = new Request({
    caregiverEmail: req.body.caregiverEmail,
    caregiverName: req.body.caregiverName,
    caregiverPhoneNumber: req.body.caregiverPhoneNumber,
    caregiverAge: req.body.caregiverAge,
    elderEmail: req.body.elderEmail,
    elderName: req.body.elderName,
    elderPhoneNumber: req.body.elderPhoneNumber,
    elderAge: req.body.elderAge,
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
  sendRequestEmail(
    request.caregiverEmail,
    request.caregiverName,
    request.caregiverPhoneNumber,
    request.caregiverAge,
    request.elderEmail,
    request.elderName,
    request.elderPhoneNumber,
    request.elderAge,
    request.selectedServices.dailyCare,
    request.selectedServices.specialCare,
    startDate,
    stopDate,
    request.requireInterview,
    totalDays,
    request.selectedDP,
    request.selectedMP
  );
  request.save().then(createdRequest => {
    res.status(201).json({
      message: "request saved successfully",
      request: createdRequest
    });
  });
});

// get all requests
app.get("/api/requests", (req, res, next) => {
  Request.find().then(documents => {
    res.status(200).json({
      message: 'fetched successfully',
      users: documents
    });
    console.log(documents)
  });
});

// get one request
app.get("/api/requests/:email", (req, res, next) => {
  Request.find({ $or: [{ caregiverEmail: req.params.email }, { elderEmail: req.params.email }], status: null }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// get request status
app.get("/api/requests-status/:email", (req, res, next) => {
  Request.find({ $or: [{ caregiverEmail: req.params.email }, { elderEmail: req.params.email }] }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
});

// update request
app.patch("/api/requests/:id", (req, res, next) => {
  const id = req.body._id;
  console.log(id);
  const request = new Request({
    _id: req.body._id,
    status: req.body.status,
    rejectionReason: req.body.rejectionReason
  });
  Request.findById(req.params.id).then(req => {
    const startDate = `${req.startDate.getDate()}/${req.startDate.getMonth() + 1}/${req.startDate.getFullYear()}`;
    const stopDate = `${req.stopDate.getDate()}/${req.stopDate.getMonth() + 1}/${req.stopDate.getFullYear()}`;
    const totalDays = Math.trunc((req.stopDate.getTime() - req.startDate.getTime()) / 86400000);
    sendRequestResponseEmail(
      req.caregiverEmail,
      req.caregiverName,
      req.caregiverPhoneNumber,
      req.caregiverAge,
      req.elderEmail,
      req.elderName,
      req.elderPhoneNumber,
      req.elderAge,
      req.selectedServices.dailyCare,
      req.selectedServices.specialCare,
      startDate,
      stopDate,
      req.requireInterview,
      totalDays,
      req.selectedDP,
      req.selectedMP,
      request.status,
      request.rejectionReason
    );
  });
  Request.findByIdAndUpdate(id, { $set: { status: req.body.status, rejectionReason: req.body.rejectionReason } }).then(result => {
    res.status(200).json({ message: "Update successful!" });
    console.log('updated')
    console.log(request);
  });
});

// delete request
app.delete("/api/requests/:id", (req, res, next) => {
  const id = req.params.id;
  console.log(id)
  Request.findByIdAndRemove(id).then(result => {
    res.status(200).json({ message: "Delete successful" })
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
// get one user
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

// signup user
app.post("/api/authusers/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const authUser = new AuthUser({
      name: req.body.name,
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

// login
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

// get all auth users
app.get("/api/authusers", (req, res, next) => {
  AuthUser.find().then(documents => {
    res.status(200).json({
      message: "Fetched successfully",
      users: documents
    });
  })
})

// get one auth users
app.get("/api/authusers/:email", (req, res, next) => {
  AuthUser.findOne({ email: req.params.email }).then(document => {
    if (!document) {
      res.status(200).json({
        exist: false
      });
    } else {
      res.status(200).json({
        exist: true
      });
    }
  });
})

// forgot password
app.post("/api/authusers/forgotPassword", (req, res, next) => {
  // 1) Get user based on POSTed email
  AuthUser.findOne({ email: req.body.email }, function (err, returnedUser) {
    console.log(returnedUser);

    // 2) Generate the random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    returnedUser.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    console.log(returnedUser.passwordResetToken);
    returnedUser.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    returnedUser.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `http://localhost:4200/reset-password/${resetToken}`;
    console.log(resetURL)

    console.log('returned user info', returnedUser);
    sendPasswordResetEmail(returnedUser.email, returnedUser.name, resetURL);
  });
});

// find one user based on password reset token
app.get("/api/authusers/:token", (req, res, next) => {
  const token = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  AuthUser.findOne({ passwordResetToken: token }).then(document => {
    res.status(200).json(document);
    console.log(document)
  });
})

// reset password
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
  }, function (err, user) {
    console.log(user);
    bcrypt.hash(req.body.password, 10).then(hash => {
      user.password = hash;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.save();
      sendPasswordResetConfirmEmail(user.name, user.email);
    });
  });
});

// export app
module.exports = app;

