import Event from "../models/Event.js"
// Create an event
export const createEvent = async (req, res) => {
  const { id, title, description, shortDescription, startDate, endDate, timezone, venue, capacity, price, currency, images, tags, status, isPrivate, requiresApproval, maxTickets, refundPolicy } = req.body;
  
  const file = req.file;
  const filePath = file ? file.path : null;
  const fileName = file ? file.filename : null;

  const event = await Event.create({ id, title, description, shortDescription, startDate, endDate, timezone, venue, capacity, price, currency, images, tags, status, isPrivate, requiresApproval, maxTickets, refundPolicy  })};

  if (!['Lagos','Ogun'].includes(state)) {
    return res.status(400).json({
      status: false,
      message: "Event must be in Lagos or Ogun",
      data: null,
    });
  

  return res.status(201).json({
    status: true,
    message: "Event created sucessfully", 
    data : Event,
  });
} 

// update an event

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const book = await Event.findByPk(Number(id));

  if (!updateEvent) {
    return res.status(400).json({
      status: false,
      message: "Event not found",
      data: [],
    });
  }

  await Event.update(req.body);

  return res.status(200).json({
    status: true,
    message: "Event updated successfully",
    data: Event,
  });
}

//delete an event
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const event = await Event.findByPk(Number(id));
  await event.destroy();

  return res.status(200).json({
    status: true,
    message: "event deleted successfully",
    data: [],
  });
};

