const express = require('express');
const itemsModel = require('./items-model');
const eventsModel = require('../events/events-model');
const invitationsModel = require('../invitations/invitations-model');

const router = express.Router();

// Invitee see what items they are bringing
router.get('/', async (req, res) => {
  const user_id = req.user_id;
  const items = await itemsModel.findAll();
  const userItems = items.filter((item) => {
    if (item.user_id === user_id) {
      return item;
    }
  });
  if (userItems.length === 0) {
    res.json({ message: 'user has no items they are bringing yet' });
  } else {
    res.json(userItems);
  }
});

// User sees all items for the event
router.get('/:event_id', async (req, res) => {
  const event_id = parseInt(req.params.event_id);
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

// Invitee update that they are bringing an item
router.put('/:item_id', async (req, res) => {
  const item_id = parseInt(req.params.item_id);
  const itemRes = await itemsModel.findById(item_id);
  const event_id = itemRes[0].event_id;
  const invitations = await invitationsModel.findAll();
  const tokenId = req.user_id;
  const isInvited = invitations.filter((invitation) => {
    if (invitation.user_id === tokenId && invitation.event_id === event_id) {
      return true;
    }
  });
  if (!isInvited[0]) {
    res.json({ message: `invalid credentials` });
  } else {
    const updatedItem = await itemsModel.updateItemById(item_id, req.body);
    res.json(updatedItem);
  }
});

//   Event creator deletes item
router.delete('/:item_id', async (req, res) => {
  const itemId = parseInt(req.params.item_id);
  const itemRes = await itemsModel.findById(itemId);
  const event_id = itemRes[0].event_id;
  const eventsRes = await eventsModel.findById(event_id);
  const { owner_id } = eventsRes[0];
  const user_id = req.user_id;
  if (user_id !== owner_id) {
    res.json({ message: `invalid credentials` });
  } else {
    const result = await itemsModel.deleteItem(itemId);
    res.json(result);
  }
});

module.exports = router;
