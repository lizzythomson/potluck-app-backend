const express = require('express');
const invitationsModel = require('./invitations-model');
const eventsModel = require('../events/events-model');

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
  const event_id = parseInt(req.params.event_id);
  const user_id = req.user_id;
  const eventsRes = await eventsModel.findById(event_id);
  const { owner_id } = eventsRes[0];
  if (owner_id !== user_id) {
    res.json({ message: 'invalid credentials' });
  }
  const invitations = await invitationsModel.findAll();
  const eventInvitations = invitations.filter((invitation) => {
    if (invitation.event_id === event_id) {
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
  const newInvite = await invitationsModel.insertInvitation(req.body);
  res.json(newInvite);
});

// User/Invitee updating status on invitation
router.put('/:invitation_id', async (req, res) => {
  const invitation_id = parseInt(req.params.invitation_id);
  const invitationsRes = await invitationsModel.findById(invitation_id);
  const user_id = invitationsRes[0].user_id;
  const tokenId = req.user_id;
  if (user_id !== tokenId) {
    res.json({ message: `invalid credentials` });
  } else {
    const updatedInvitation = await invitationsModel.updateInvitation(
      invitation_id,
      req.body
    );
    res.json(updatedInvitation);
  }
});

//   Event owner deletes invitation
router.delete('/:invitation_id', async (req, res) => {
  const invitationId = parseInt(req.params.invitation_id);
  const invitationsRes = await invitationsModel.findById(invitationId);
  const event_id = invitationsRes[0].event_id;
  const eventsRes = await eventsModel.findById(event_id);
  const { owner_id } = eventsRes[0];
  const user_id = req.user_id;
  if (user_id !== owner_id) {
    res.json({ message: `invalid credentials` });
  } else {
    const result = await invitationsModel.deleteInvitation(invitationId);
    res.json(result);
  }
});

module.exports = router;
