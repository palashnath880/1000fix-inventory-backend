import { Request, Response } from "express";

// user create controller
const create = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    res.send(err).status(400);
  }
};

// get all user
const get = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    res.send(err).status(400);
  }
};

// get by id
const getById = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    res.send(err).status(400);
  }
};

// user update controller
const update = async (req: Request, res: Response) => {
  try {
    //   const userId = req
  } catch (err) {
    res.send(err).status(400);
  }
};

// user delete controller
const deleteUser = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    res.send(err).status(400);
  }
};
export default { create, deleteUser, update, get, getById };
