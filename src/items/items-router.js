const express = require('express');
const itemsModel = require('./itemsModel');
const eventsModel = require('../events/events-model');
const invitationsModel = require('../invitations/invitations-model');

const router = express.Router();

// Owner of event to get all items for event
router.get('/:event_id', async (req, res) => {
  const event_id = parseInt(req.params.id);
  const user_id = req.user_id;
  const { owner_id } = await eventsModel.findById(event_id);
  if (owner_id !== user_id) {
    res.json({ message: 'invalid credentials' });
  }
  const items = await itemsModel.findAll();
  const eventItems = items.filter((item) => {
    if (item.event_id === event_id) {
      return item;
    }
  });
  if (eventItems.length === 0) {
    res.json({ message: 'event creator has not added any items' });
  } else {
    res.json(eventItems);
  }
});

router.post('/', async (req, res) => {
  const newItem = await itemsModel.insertItem(req.body);
  res.json(newItem);
});

// User/Invitee selecting item to bring
router.put('/:item_id', async (req, res) => {
  const invitation_id = parseInt(req.params.id);
  const { event_id } = await eventsModel.findById(event_id);
  const invitees = await invitationsModel.findAll();
  const tokenId = req.user_id;
  const isInvited = await invitees.filter((invitee) => {
    if (invitee.user_id === tokenId) {
      return true;
    }
  });
  if (isInvited === false) {
    res.json({ message: `sorry. you weren't invited to this event` });
  } else {
    const updatedInvitation = await itemsModel.updateEventById(
      invitation_id,
      req.body
    );
    res.json(updatedInvitation);
  }
});

//   Event owner deletes item
router.delete('/:invitation_id', async (req, res) => {
  const invitationId = parseInt(req.params.id);
  const { event_id } = await itemsModel.findById(invitationId);
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
