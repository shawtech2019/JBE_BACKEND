const express = require("express");
const router = express.Router();

const property = require("../controllers/property.controller");
const validate = require("../middlewares/validate.middleware");
const schema = require("../validators/property.validator");
const { authenticate } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/property-upload.middleware");

// Every property route requires a signed-in user.
router.use(authenticate);

router.get("/", property.listProperties);

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "videos", maxCount: 10 },
  ]),
  validate(schema.createPropertySchema),
  property.createProperty
);

router.get("/:id", property.getProperty);

module.exports = router;
