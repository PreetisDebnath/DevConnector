const express = require('express');
const router = express.Router();
const bcrypt =  require('bcryptjs');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const config = require('config');
const jwt = require('jsonwebtoken');  
const { check, validationResult } = require('express-validator');

// @route    GET api/auth
// @desc     Test route
// @access   Public

router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
});


// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public

router.post(
  '/',
  [
    check('email', 'Please enter a valid Email').isEmail(),
    check(
      'password',
      'Password is required!',
    ).exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const normalizedEmail = email.trim().toLowerCase();
      let user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials!' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if(!isMatch){
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials!' }] });
      }

      const payload = {
        user:{
          id: user.id
        }
      }

      jwt.sign(
        payload,
        process.env.JWT_SECRET || config.get('jwtSecret'),
        {expiresIn: 3600000},
        (err, token) => {
          if(err) throw err;
          res.json({token});
        }
      );

    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error!');
    }
  },
);

module.exports = router;