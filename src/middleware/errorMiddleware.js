exports.errorMiddleware = (error, req, res, next) => {
  let customError = {
    statusCode: error.statusCode || 500,
    message: error.message || "Something went wrong! Please try again later!",
  };

  console.error(error)

  if (error.name === "ValidationError") {
    customError.validationErrors = Object.values(error.errors).map(
      (item) => item.message
    );

    customError.statusCode = 400;
  }

  if (error.code && error.code === 11000) {
    customError.message = `A value that already exists has been entered again for ${Object.keys(
      error.keyValue
    )} field, please choose another value`;
    customError.statusCode = 400;
  }

  if (error.name === "CastError") {
    customError.message = `no item found with id : ${error.value}`;
    customError.statusCode = 400;
  }

  if (process.env.NODE_ENV === "development") {
    console.error(error);

    customError.message = errormessage || "😀";
    customError.error = error;
  }

  return res.status(customError.statusCode).json(customError);
};
