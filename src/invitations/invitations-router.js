const express = require('express');
const invitationsModel = require('./invitations-model');
const eventsModel = require('./events-model');

const router = express.Router();

// User/Invitee to see all their invitations
router.get('/', async (req, res) => {
  const user_id = req.user_id;
  const invitations = await invitationsModel.findAll();
  const userInvitations = invitations.filter((invitation) => {
    if (invitation.user_id === user_id) {
      return invitation;
    }
  });
  if (userInvitations.length === 0) {
    res.json({ message: 'user has no invitations yet' });
  } else {
    res.json(userInvitations);
  }
});

// Owner of event to get all invitations for an event
router.get('/:event_id', async (req, res) => {
  const event_id = parseInt(req.params.id);
  const user_id = req.user_id;
  const { owner_id } = await eventsModel.findById(event_id);
  if (owner_id !== user_id) {
    res.json({ message: 'invalid credentials' });
  }
  const invitations = await invitationsModel.findAll();
  const eventInvitations = invitations.filter((invitation) => {
    if (invitation.owner_id === user_id) {
      return invitation;
    }
  });
  if (eventInvitations.length === 0) {
    res.json({ message: 'user has not created any events' });
  } else {
    res.json(eventInvitations);
  }
});

router.post('/', async (req, res) => {
  const newEvent = await invitationsModel.insertEvent(req.body);
  res.json(newEvent);
});

// User/Invitee updating status on invitation
router.put('/:invitation_id', async (req, res) => {
  const invitation_id = parseInt(req.params.id);
  const { user_id } = await invitationsModel.findById(invitation_id);
  const tokenId = req.user_id;
  if (user_id !== tokenId) {
    res.json({ message: `invalid credentials` });
  } else {
    const updatedInvitation = await invitationsModel.updateEventById(
      invitation_id,
      req.body
    );
    res.json(updatedInvitation);
  }
});

//   Event owner deletes invitation
router.delete('/:invitation_id', async (req, res) => {
  const invitationId = parseInt(req.params.id);
  const { event_id } = await invitationsModel.findById(invitationId);
  const { owner_id } = await eventsModel.findById(event_id);
  const user_id = req.user_id;
  if (user_id !== owner_id) {
    res.json({ message: `invalid credentials` });
  } else {
    const result = await eventsModel.deleteEvent(invitationId);
    res.json(result);
  }
});

module.exports = router;
