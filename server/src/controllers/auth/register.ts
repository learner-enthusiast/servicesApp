import { type RequestHandler } from 'express';
import joi from '../../utils/joi';
import jwt from '../../utils/jwt';
import crypt from '../../utils/crypt';
import Account from '../../models/Account';
import { UserTypeEnum } from '../../utils/enums';
import { uploadOnCloudinary } from '../../utils/cloudinary';

const register: RequestHandler = async (req, res, next) => {
  try {
    // const validationError = await joi.validate(
    //   {
    //     username: joi.instance.string().required(),
    //     password: joi.instance.string().required(),
    //   },
    //   req.body
    // );

    // if (validationError) {
    //   return next(validationError);
    // }

    const { username, password, userType } = req.body;

    const avatar = await uploadOnCloudinary(req.file?.path);
    // Verify account username as unique
    const found = await Account.findOne({ username });

    if (found) {
      return next({
        statusCode: 400,
        message: 'An account already exists with that "username"',
      });
    }

    // Encrypt password
    const hash = await crypt.hash(password);

    // Create account
    const account = new Account({
      username,
      password: hash,
      ...(userType && { type: userType }),
      ...(avatar && { photo: avatar?.url }),
    });
    await account.save();

    // Generate access token
    const token = jwt.signToken({
      uid: account._id,
      role: account.role,
      ...(userType && { type: userType }),
    });

    // Exclude password from response
    const { password: _, ...data } = account.toObject();

    res.status(201).json({
      message: 'Succesfully registered',
      data,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export default register;
