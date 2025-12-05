// controllers/joinRequestController.js

const JoinRequest = require('../models/Join_request');
const OrgOfficer = require('../models/Org_officer');

// ===============================
// CREATE JOIN REQUEST
// ===============================
exports.createJoinRequest = async (req, res) => {
  // === SERVER LOG: Check the received body ===
  console.log('SERVER: Received /api/join-request POST body:', req.body);
  
  const { student_id, organization_id } = req.body;

  // Crucial check: If req.body is empty, this will log and respond with 400
  if (!student_id || !organization_id) {
    console.log('SERVER ERROR: Missing required fields in body (student_id or organization_id).');
    return res.status(400).json({ message: 'Missing student_id or organization_id in request body.' });
  }

  try {
    // Check if request already exists
    const existingRequest = await JoinRequest.findOne({ student_id, organization_id });
    if (existingRequest) {
      console.log('SERVER INFO: Existing join request found. Aborting.');
      return res.status(400).json({ message: 'You have already submitted a join request for this organization.' });
    }
    
    console.log('SERVER INFO: Creating new join request...');
    const joinRequest = await JoinRequest.create({ student_id, organization_id });
    console.log('SERVER SUCCESS: Join request created:', joinRequest._id);
    
    res.status(201).json(joinRequest);
  } catch (err) {
    // Log the database error
    console.error('SERVER FATAL ERROR: Failed to create join request in database.', err);
    res.status(500).json({ message: 'Failed to create join request' });
  }
};

// ===============================
// GET ALL PENDING REQUESTS (for admin)
// ... (rest of the file remains the same)
// ===============================
exports.getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await JoinRequest.find({ status: 'Pending' })
      .populate('student_id', 'first_name last_name student_number')
      .populate('organization_id', 'org_name');

    res.json(pendingRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch pending requests' });
  }
};

// ===============================
// UPDATE REQUEST STATUS (APPROVE/REJECT)
// ... (rest of the file remains the same)
// ===============================
exports.updateRequestStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status, role } = req.body; 

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const request = await JoinRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Join request not found' });

    request.status = status;
    await request.save();

    // If approved, add to Org_officer
    if (status === 'Approved') {
      try {
        await OrgOfficer.create({
          student_id: request.student_id,
          org_id: request.organization_id,
          role: role || 'Member', 
        });
      } catch (err) {
        console.error('Failed to add OrgOfficer:', err);
      }
    }

    res.json({ message: `Request ${status.toLowerCase()} successfully`, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update request status' });
  }
};

// ===============================
// GET STUDENT REQUESTS
// ... (rest of the file remains the same)
// ===============================
exports.getStudentRequests = async (req, res) => {
  const { student_id } = req.params;

  try {
    const requests = await JoinRequest.find({ student_id })
      .populate('organization_id', 'org_name description');

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch student requests' });
  }
};