import type { Request, Response } from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';

import {
  createUserService,
  getUsersService,
  getOneUserService
} from '@/services/user.service';

const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
}).messages({
  'any.required': 'El campo {{#label}} es obligatorio',
  'string.email': 'El campo email debe ser un email válido',
  'string.min': 'El campo {{#label}} debe tener al menos 6 caracteres'
});

export const createUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // obtenemos el body de la request
  const user = req.body;

  // validamos el body de la request
  const { error } = createUserSchema.validate(user, {
    abortEarly: false
  });

  if (error) {
    res.status(400).json({
      message: 'Could not create user',
      error: error.details
    });
    return;
  }

  // hasheamos la contraseña
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(user.password, salt);

  const newUser = {
    ...user,
    password: hashedPassword
  };

  try {
    // creamos el usuario
    const createdUser = await createUserService(newUser);
    res.status(201).json({
      message: 'User created successfully!',
      user: createdUser
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not create user',
      error
    });
  }
};

export const getUsersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await getUsersService();
    res.status(200).json({
      message: 'Users fetched successfully!',
      users
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not fetch users',
      error
    });
  }
};

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
}).messages({
  'string.email': 'El campo email debe ser un email válido',
  'string.min': 'El campo {{#label}} debe tener al menos 6 caracteres'
});

export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const loginData = req.body;

  // validamos el body de la request
  const { error } = loginSchema.validate(loginData, {
    abortEarly: false
  });

  if (error) {
    res.status(400).json({
      message: 'Could not login',
      error: error.details
    });
    return;
  }

  // obtenemos el usuario de la base de datos
  const { email } = loginData;
  const user = await getOneUserService({ email });

  if (!user) {
    res.status(404).json({
      message: 'User not found'
    });
  }

  res.json({
    message: 'User logged in successfully!',
    user
  });
};
