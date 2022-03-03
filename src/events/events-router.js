const express = require('express');
const eventsModel = require('./events-model');

const router = express.Router();

// Owner can see all their events they created
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

// A new event can be created
router.post('/', async (req, res) => {
  const newEvent = await eventsModel.insertEvent(req.body);
  res.json(newEvent);
});

// An event owner can update an event
router.put('/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const eventRes = await eventsModel.findById(eventId);
  const user_id = req.user_id;
  const owner_id = eventRes[0].owner_id;
  if (user_id !== owner_id) {
    res.json({ message: `invalid credentials` });
  } else {
    const updatedUser = await eventsModel.updateEventById(eventId, req.body);
    res.json(updatedUser);
  }
});

// The event owner can delete an event
router.delete('/:event_id', async (req, res) => {
  const { event_id } = req.params;
  const eventRes = await eventsModel.findById(event_id);
  const owner_id = eventRes[0].owner_id;
  const user_id = req.user_id;
  if (user_id !== owner_id) {
    res.json({ message: `invalid credentials` });
  } else {
    const result = await eventsModel.deleteEvent(event_id);
    res.json(result);
  }
});

module.exports = router;
