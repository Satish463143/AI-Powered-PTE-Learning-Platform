const { bodyValidator } = require('../../middleware/validator.middleware');
const userController = require('./user.controller');
const { userDTO } = require('./user.request');

const router = require('express').Router();

router.route('/')
    .post(bodyValidator(userDTO) ,userController.createUser)
    .get(userController.index);

router.route('/:id')
    .get(userController.showById)
    .put(userController.update)
    .delete(userController.delete);

module.exports = router
