var Outlet = require("../../models/outlet");
var User = require("../../models/user");
var Dish = require("../../models/dish");
var Brand = require("../../models/brand");
var s3 = require("../../aws-services/aws");
const { v4: uuidv4 } = require("uuid");
const sendGridMail = require("@sendgrid/mail");
const { hashSync } = require("bcrypt");
const HttpError = require("../../models/http-error");
const redis = require("redis");
// const client = redis.createClient();
const {
  deleteImageFromS3,
  addImageToS3,
} = require("../../../aws-services/s3-service/aws-s3");
const { addToQueue } = require("../../aws-services/email-service/aws-sqs");
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
var async = require("async");
const mongoose = require("mongoose");
var itemsPerPage = 9;
exports.getOutlets = function (req, res, next) {
  if (req.query.page) req.query.page = +req.query.page;
  var skip =
    req.query.page && req.query.page != "undefined"
      ? (parseInt(req.query.page) - 1) * itemsPerPage
      : 0;

  async.parallel(
    [
      function (cb) {
        Outlet.aggregate(
          [
            { $match: { "brandDetails.id": req.params.brandId } },
            { $skip: skip },
            { $limit: itemsPerPage },
            {
              $group: {
                _id: "$brandId",
                outlets: { $push: "$$ROOT" },
              },
            },
          ],
          function (err, data) {
            cb(null, { outlets: data.length == 0 ? [] : data[0].outlets });
          }
        );
      },
      function (cb) {
        Outlet.aggregate(
          [
            { $match: { "brandDetails.id": req.params.brandId } },
            { $count: "totalItems" },
          ],
          function (err, data) {
            cb(null, { totalItems: data.length == 0 ? 0 : data[0].totalItems });
          }
        );
      },
    ],
    function (err, data) {
      res.status(200).json({
        message: "Outlets Fetched",
        outlets: data.length == 0 ? [] : data[0].outlets,
        totalItems: data.length == 0 ? 0 : data[1].totalItems,
      });
    }
  );
};

exports.getOutlet = function (req, res, next) {
  Outlet.findById(req.params.outletId)
    .then(function (outlet) {
      if (!outlet) {
        var error = new HttpError("Outlet not found", 404);
        return next(error);
      }
      res.status(200).json({
        message: "Outlet Fetched",
        outlet: outlet,
      });
    })
    .catch(function (err) {
      console.log(err);
      next(err);
    });
};

exports.createOutlet = function (req, res, next) {
  var { name, address } = req.body;
  var fileName = "";
  if (req.files) {
    if (!MIME_TYPE_MAP[req.files.image.mimetype]) {
      var error = new HttpError("Invalid image type", 401);
      return next(error);
    }
    fileName = uuidv4() + "." + MIME_TYPE_MAP[req.files.image.mimetype];
  }

  addImageToS3(req, {
    fileName: fileName,
    data: req.files ? req.files.image.data : "",
  }).then(function () {
    var newoutlet = new Outlet({
      name: name,
      image: fileName,
      address: address,
      brandDetails: { id: req.body.brandId, name: req.body.brandName },
    });
    newoutlet
      .save()
      .then(function (outlet) {
        var admins = [];
        if (req.body.admins) {
          req.body.admins = JSON.parse(req.body.admins);
          admins = req.body.admins.map(function (admin) {
            User.findOne({ email: admin.email }).then(function (user) {
              if (!user) {
                var error = new HttpError("Admin Not found", 401);
                return next(error);
              }
              user.entityDetails.push({
                entityId: outlet.id,
                entityName: outlet.name,
                entityImage: outlet.image,
              });
              user
                .save()
                .then(function (user) {
                  console.log(user);
                  return user;
                })
                .catch(function (err) {
                  console.log(err);
                  next(err);
                });
            });
          });
        }
        Promise.all(admins)
          .then(function () {
            res.status(200).json({
              message: "Outlet Created!",
              outlet: outlet,
            });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      })
      .catch(function (err) {
        console.log(err);
        next(err);
      });
  });
};

exports.updateOutlet = function (req, res, next) {
  Outlet.findById(req.query.outletId)
    .then(function (oldoutlet) {
      if (!oldoutlet) {
        var error = new HttpError("Outlet not found", 404);
        return next(error);
      }
      var fileName = "";
      if (req.files) {
        if (!MIME_TYPE_MAP[req.files.image.mimetype]) {
          var error = new HttpError("Invalid image type", 401);
          return next(error);
        }
        fileName = uuidv4() + "." + MIME_TYPE_MAP[req.files.image.mimetype];
        deleteImageFromS3({
          fileName: oldoutlet.outletImage,
        });
      }
      addImageToS3(req, {
        fileName: fileName,
        data: req.files ? req.files.image.data : "",
      })
        .then(function () {
          async.parallel(
            [
              function (cb) {
                oldoutlet.image = fileName;
                oldoutlet.status = req.body.status
                  ? req.body.status
                  : oldoutlet.status;
                oldoutlet.isdeleted = req.body.isdeleted
                  ? req.body.isdeleted
                  : oldoutlet.isdeleted;
                oldoutlet.name = req.body.name ? req.body.name : oldoutlet.name;
                oldoutlet.address = req.body.address
                  ? req.body.address
                  : oldoutlet.address;

                oldoutlet
                  .save()
                  .then(function (newOutlet) {
                    cb(null, { outlet: newOutlet });
                  })
                  .catch(function (err) {
                    next(err);
                  });
              },
              function (cb) {
                var oldusers = [];
                // client.hmset("outlets", newOutlet.id, JSON.stringify(newOutlet));
                User.find({
                  "role.roleName": { $ne: "superAdmin" },
                  "entityDetails.entityId": req.query.outletId,
                }).then(function (users) {
                  users.forEach(function (user) {
                    var idx = user.entityDetails.findIndex(function (entity) {
                      return entity.entityId == req.query.outletId;
                    });
                    console.log(idx);
                    if (idx !== -1) {
                      user.entityDetails[idx].entityName = req.body.name
                        ? req.body.name
                        : oldoutlet.name;
                      user.entityDetails[idx].entityId = oldoutlet.id;
                      user.entityDetails[idx].entityImage = fileName;
                      user
                        .save()
                        .then(function (newUser) {
                          oldusers.push(newUser);
                        })
                        .catch(function (err) {});
                    }
                  });
                });
                Promise.all(oldusers)
                  .then(function () {
                    cb(null);
                  })
                  .catch(function (err) {});
              },
            ],
            function (err, data) {
              res.status(200).json({
                message: "Outlet updated successfully!",
                outlet: data[0].outlet,
              });
            }
          );
        })
        .catch(function (err) {
          next(err);
        });
    })
    .catch(function (err) {
      next(err);
    });
};

var itemsPerPage = 9;
exports.getAdminsOfAOutlet = function (req, res, next) {
  if (req.query.page) req.query.page = +req.query.page;
  var skip =
    req.query.page && req.query.page != "undefined"
      ? (parseInt(req.query.page) - 1) * itemsPerPage
      : 0;
  User.aggregate(
    [
      { $unwind: "$entityDetails" },
      {
        $match: {
          "role.roleName": "Admin",
          "entityDetails.entityId": req.params.outletId,
        },
      },
      {
        $group: {
          _id: "$role.roleName",
          admins: {
            $push: "$$ROOT",
          },
        },
      },
    ],
    function (err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log(data);
      res.status(200).json({
        message: "Admins Fetched",
        admins: data.length == 0 ? [] : data[0].admins,
      });
    }
  );
};

exports.getAdmin = function (req, res, next) {
  User.findById(req.params.adminId)
    .then(function (user) {
      if (!user) {
        var error = new HttpError("User not found", 404);
        return next(error);
      }
      res.status(200).json({
        message: "User Fetched",
        user: user,
      });
    })
    .catch(function (err) {
      console.log(err);
      next(err);
    });
};

exports.createAdmin = function (req, res, next) {
  User.findOne({
    email: req.body.email,
  }).then(function (user) {
    if (user) {
      var error = new HttpError("User already exists", 401);
      return next(error);
    }
    var entity, roleName;
    entity = "Outlet";
    roleName = "Admin";
    req.body.permissions = JSON.parse(req.body.permissions);
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashSync(req.body.password, 10),
      role: {
        entity: entity,
        roleName: roleName,
      },
      entityDetails: [
        {
          entityId: req.body.entityId,
          entityName: req.body.entityName,
        },
      ],
      permissions: req.body.permissions,
    });
    newUser.save().then(function (user) {
      addToQueue({
        email: req.body.email,
        name: req.body.name,
        subject: "Signup success",
        text: "Successfully signed up",
        html: `<div><h1>Welcome to the food Ordering App</h1></div>
            <h3>Here are you credentials</h3>
            <div><p>Name: ${req.body.name}</p></div>
            <div><p>Email: ${req.body.email}</p></div>
            <div><p>Role: ${newUser.role.entity}-${newUser.role.roleName}</p></div>
            <div><p>Thank you for signing up</p></div>
            `,
      });

      res.status(200).json({
        message: "Admin Registered",
        user: newUser,
      });
    });
  });
};

exports.updateAdmin = function (req, res, next) {
  console.log(req.body);
  User.findOne({
    _id: mongoose.Types.ObjectId(req.body.adminId),
  }).then(function (admin) {
    if (!admin) {
      var error = new HttpError("Admin not found", 404);
      return next(error);
    }
    console.log(admin);
    req.body.entityDetails = JSON.parse(req.body.entityDetails);
    req.body.permissions = JSON.parse(req.body.permissions);
    var fileName = "";
    if (req.files) {
      if (!MIME_TYPE_MAP[req.files.image.mimetype]) {
        var error = new HttpError("Invalid image type", 401);
        return next(error);
      }
      fileName = uuidv4() + "." + MIME_TYPE_MAP[req.files.image.mimetype];
      deleteImageFromS3({
        fileName: admin.image,
      });

      admin.image = fileName;
    }
    addImageToS3(req, {
      fileName: fileName,
      data: req.files ? req.files.image.data : "",
    }).then(function () {
      admin.status = req.body.status ? req.body.status : admin.status;
      admin.isdeleted = req.body.isdeleted
        ? req.body.isdeleted
        : admin.isdeleted;
      if (req.body.permissions) {
        admin.permissions = req.body.permissions;
      }
      var details = [];
      if (req.body.entityDetails && req.body.entityDetails.length > 0)
        req.body.entityDetails.forEach(function (entity) {
          details.push({
            entityId: entity._id,
            entityName: entity.name,
          });
        });
      admin.entityDetails = details;
      admin
        .save()
        .then(function (newAdmin) {
          client.hset("users", newAdmin.id, JSON.stringify(newAdmin));

          res.status(200).json({
            message: "Admin Updated",
            admin: newAdmin,
          });
        })
        .catch(function (err) {
          console.log(err);
          next(err);
        });
    });
  });
};

exports.getAllOutletAdmins = function (req, res, next) {
  Outlet.find({ brandId: req.params.brandId }).then(function (outlets) {
    if (!outlets) {
      var error = new HttpError("Super Admin not found", 404);
      return next(error);
    }
    var ids = [];
    outlets.forEach(function (outlet) {
      ids.push(outlet.id);
    });

    User.aggregate(
      [
        { $unwind: "$entityDetails" },
        {
          $match: {
            "role.roleName": "Admin",
            "role.entity": "Outlet",
            "entityDetails.entityId": {
              $in: ids,
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            email: {
              $first: "$email",
            },
            name: {
              $first: "$name",
            },
          },
        },
      ],
      function (err, data) {
        console.log(data);
        res.status(200).json({
          message: "All Admins Fetched",
          admins: data.length == 0 ? [] : data,
        });
      }
    );
  });
};
