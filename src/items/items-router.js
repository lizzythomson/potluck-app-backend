const express = require('express');
const eventsModel = require('../events/events-router');

const router = express.Router();

router.get('/', async (req, res) => {
  const user_id = req.user_id;
  const events = await eventsModel.findAll();
  const ownerEvents = events.filter((event) => {
    if (event.owner_id === user_id) {
      return event;
    }
  });
  if (ownerEvents.length === 0) {
    res.json({ message: 'user has not created any events' });
  } else {
    res.json(ownerEvents);
  }
});

router.post('/', async (req, res) => {
  const newEvent = await eventsModel.insertEvent(req.body);
  res.json(newEvent);
});

router.put('/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { owner_id } = await eventsModel.findById(eventId);
  const user_id = req.user_id;
  if (user_id !== owner_id) {
    res.json({ message: `invalid credentials` });
  } else {
    const updatedUser = await eventsModel.updateEventById(eventId, req.body);
    res.json(updatedUser);
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { owner_id } = await eventsModel.findById(id);
  const user_id = req.user_id;
  if (user_id !== owner_id) {
    res.json({ message: `invalid credentials` });
  } else {
    const result = await eventsModel.deleteEvent(id);
    res.json(result);
  }
});

module.exports = router;
