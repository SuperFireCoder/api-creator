/**
 * Error handler for api routes
 */

import Raven from 'raven';
import PrettyError from 'pretty-error';

import constants from '../config/constants';

const isProd = process.env.NODE_ENV === 'production';

// eslint-disable-next-line no-unused-vars
export default function logErrorService(err, req, res, next) {
  if (!err) {
    return res.sendStatus(500);
  }

  if (isProd) {
    const raven = new Raven.Client(constants.RAVEN_ID);
    raven.captureException(err);
  }

  const pe = new PrettyError();
  pe.skipNodeFiles();
  pe.skipPackage('express');

  // eslint-disable-next-line no-console
  console.log(pe.render(err));

  const error = {
    message: err.message || 'Internal Server Error.',
  };

  if (err.errors) {
    error.errors = {};
    const { errors } = err;
    Object.keys(errors).forEach(key => {
      error.errors[key] = errors[key].message;
    });
  }
  res.status(err.status || 500).json(error);

  next();
}
