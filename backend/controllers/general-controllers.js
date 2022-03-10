const HttpError = require("../models/http-error");
const drugs = require("../database/drugs");
const Doctor = require("../models/doctor");
const Patient = require("../models/patient");

exports.getDrug = (req, res, next) => {
  // console.log(drugs);
  const { drugName } = req.query;
  let drug;
  drug = drugs.find((drug) => {
    const drug_Name = drug.Name.toLowerCase();
    return drug_Name === drugName.toLowerCase();
  });
  if (!drug) {
    return next(new HttpError("Drug not found", 404));
  }
  res.status(201).json({ drug: drug });
};

exports.getUser = async (req, res, next) => {
  const id = req.params.id;

  let user;

  try {
    user = await Doctor.findById(id);
    if (!user) {
      user = await Patient.findById(id);
    }
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log(error.message);
  }
};
