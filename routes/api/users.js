const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route    POST api/users
// @desc     Register user
// @access   Public

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid Email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters',
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const normalizedEmail = email.trim().toLowerCase();
      let user = await User.findOne({ email: normalizedEmail });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists!' }] });
      }

      const avatar = gravatar.url(
        normalizedEmail,
        {
          s: '200',
          r: 'pg',
          d: 'mm',
        },
        'https',
      );

      user = new User({
        name,
        email: normalizedEmail,
        avatar,
        password,
      });

      const salt = await bcrypt.genSaltSync(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // return jsonwebtoken

      res.status(201).json({
        message: 'User Registered!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error!');
    }
  },
);

module.exports = router;
