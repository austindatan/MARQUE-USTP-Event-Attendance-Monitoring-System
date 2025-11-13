const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    event_name: { type: String, required: true },
    event_type: { type: String, enum: ["Seminar", "General Assembly", "Orientation", "Training", "Food Distribution"]},
    description: { type: String, required: true },
    event_image: { type: String }, // can be URL or file path
    event_date: { type: Date, required: true },
    start_time: { type: Date, required: true }, //date daw dari kay kani nga data type sa moongodb ga include ug time, walay sata type for time lang
    end_time: { type: Date, required: true }, //date daw dari kay kani nga data type sa moongodb ga include ug time, walay sata type for time lang
    venue: { type: String, required: true},
    status: { type: String, enum:["Upcoming", "Ongoing", "Concluded"], default: 'Upcoming' }, // e.g., 'upcoming', 'completed', 'cancelled'
    is_mandatory: { type: Boolean, default: false },
  },
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
