const { deleteFile } = require("../utilities/helper");

const bodyValidator = (schema) => {
    return async (req, res, next) => {
        try {
            const data = req.body;
            // console.log("Request body:", JSON.stringify(data)); // Log request body
            
            if (req.file) {
                data[req.file.fieldname] = req.file.filename;
            }

            await schema.validateAsync(data, { abortEarly: false });
            next();
        } catch (exception) {
            const detail = {};

            // Check if Joi validation error
            if (exception.isJoi && exception.details) {
                // File delete
                if (req.file) {
                    console.log(req.file);
                    deleteFile("./" + req.file.path);
                }

                // Map the validation errors to details object
                exception.details.map((error) => {
                    console.log("Validation error:", error);
                    
                    detail[error["path"][0]] = error.message;
                });
            } else {
                // Handle other types of errors (e.g., unexpected errors)
                console.error('validator Error:', exception);
            }
  
            next({
                status: 400,
                details: Object.keys(detail).length > 0 ? detail : { error: 'validator Error: An unknown error occurred' }
            });
        }
    };
};

module.exports = {
    bodyValidator
};
