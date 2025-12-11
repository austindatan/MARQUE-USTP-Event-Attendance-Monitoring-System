const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    event_name: { type: String, required: true },
    event_type: { type: String, enum: ["Event", "Sub-Event"] },
    description: { type: String, required: true },
    event_image: { type: String }, // can be URL or file path
    event_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    start_time: { type: Date, required: true }, // includes time
    end_time: { type: Date, required: true },   // includes time
    venue: { type: String, required: true },
    venue_details: { type: String }, // new field for additional venue info
    status: { type: String, enum: ["Upcoming", "Ongoing", "Concluded", "Cancelled"], default: 'Upcoming' },
    is_mandatory: { type: Boolean, default: false },
    remindersSent: {
      twentyFourHours: { type: Boolean, default: false },
      oneHour: { type: Boolean, default: false },
      conclusion: { type: Boolean, default: false }
    }
  },
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
