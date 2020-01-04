// import npm
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const Fuse = require('fuse.js')
const checkAuth = require('../Backend/middleware/check-auth');
const multer = require("multer")
const path = require("path");

// connect to database
mongoose
  .connect(
    "mongodb+srv://admin:"+ process.env.MONGO_ATLAS_PW +"@cluster0-douoa.azure.mongodb.net/test-database?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

// import model
const Elder = require('./model/elderModel')
const Caregiver = require('./model/caregiverModel')
const Request = require('./model/requestModel')
const Schedule = require('./model/scheduleModel')
const User = require('./model/userModel')
const AuthUser = require('./model/authUserModel')


// express app
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
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

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "angular", "index.html"));
});

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
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

// add caregivers
app.post("/api/caregivers", (req, res, next) => {
  // encrpt the password
  bcrypt.hash(req.body.password, 10).then(hash => {
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
      imagePath: req.body.imagePath,
      schedule: req.body.schedule
    });
    // save caregiver
    caregiver
      .save()
      .then(createdCaregiver => {
        res.status(201).json({
          message: "user saved successfully",
          caregiver: createdCaregiver
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
});
// get caregivers
app.get("/api/caregivers", (req, res, next) => {
  Caregiver.find().then(documents => {
    res.status(200).json({
      message: 'fetched successfully',
      users: documents
    });
    console.log(documents)
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
    imagePath: req.body.imagePath,
    schedule: req.body.availability
  });
  Caregiver.updateOne({ email: req.params.email }, caregiver).then(result => {
    res.status(200).json({ message: "Update successful!" });
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
app.put("/api/schedules/:email", (req, res, next) => {
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

// add elders
app.post("/api/elders", multer({ storage: storage }).single("image"), (req, res, next) => {
  // encrpt the password
  bcrypt.hash(req.body.password, 10).then(hash => {
    const url = req.protocol + "://" + req.get("host");
    // create caregiver model
    const elder = new Elder({
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
      imagePath: req.body.filename
      // imagePath: url + "/images/" + req.file.filename
    });
    // save elder
    elder
      .save()
      .then(createdElder => {
        res.status(201).json({
          message: "User saved successfully",
          elderId: createdElder._id,
          imagePath: createdElder.imagePath
        })
          .catch(err => {
            res.status(500).json({
              error: err
            });
          });
      });
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
app.put("/api/elders/:email",multer({ storage: storage }).single("image"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
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
    imagePath: req.body.filename
    // imagePath: url + "/images/" + req.file.filename
  });
  Elder.updateOne({ email: req.params.email }, elder).then(result => {
    res.status(200).json({ message: "Update successful!" });
  });
  // Elder.updateOne({ _id: req.params.id }, elder).then(result => {
  //   res.status(200).json({ message: "Update successful!" });
  // });
});

// add request
app.post("/api/requests", (req, res, next) => {
  const request = new Request({
    caregiverName: req.body.CaregiverName,
    caregiverEmail: req.body.caregiverEmail,
    elderName: req.body.elderName,
    elderEmail: req.body.elderEmail,
    startDate: req.body.startDate,
    stopDate: req.body.stopDate
  });
  console.log(request);
  request.save().then(createdRequest => {
    res.status(201).json({
      message: "request saved successfully."
    });
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
        process.env.JWT_KEY,
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
        user: user
      });
    });
});

app.post("/api/requests", (req, res, next) => {
  const request = new Request ({
    elderEmail: req.body.elderEmail,
    caregiverEmail: req.body.caregiverEmail,
    startDate: req.body.startDate,
    stopDate: req.body.stopDate,
    requireInterview: req.body.requireInterview
  });
  console.log(user);
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

