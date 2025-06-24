import User from "../models/user.model.js";
import dotenv from "dotenv";
import { Registration } from "../models/Registration.js";

dotenv.config();

// Create your registration
export const createRegistration = async (req, res) => {
  const { id , status, paymentStatus, paymentMethod, paymentReference, notes, attendeeInfo, qrcode, checkInTime, isCheckedIn, specialRequest, emergencyContact, userId, eventId } = req.body;
try{
  const registration = await Registration.create({
    userId,
    eventId, 
    quantity,
    totalAmount,
    status,
    paymentMethod,
    paymentReference,
    notes,
    attendeeInfo,
    qrcode,
    checkInTime,
    isCheckedIn,
    specialRequest,
    emergencyContact
   });

  if (registration) {
    return res.status(201).json({
      status: true,
      message: "Registration created sucessfully",
      data: registration,
    });
  }
  }catch(error){
    console.error('Error creating registration:',error);
    res.status(500).son({
      message:'Internal Server Error'
    })
  }
};
module.exports= {createRegistration};


// Get all registration for a specific user
const getRegistrationsByUser = async (req, res) => {
  try{
    const {userId} = req.params;

    const registration = await Registration.findAll({
      where:{userId}
    });
    return res.status (200).json({
      status: true,
      data: registration});
    }catch(error){
       console.error('Error creating registration:',error);
    res.status(500).son({
      message:' Server Error'
    });
  }
};
