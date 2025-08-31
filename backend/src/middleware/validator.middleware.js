const { bucket } = require('../config/googleCloud.config');

const bodyValidator = (schema) => {
    return async (req, res, next) => {
        try {
            const data = req.body;
            
            if (req.file) {
                // Use cloud storage URL instead of filename
                data[req.file.fieldname] = req.file.cloudStoragePublicUrl;
            }

            await schema.validateAsync(data, { abortEarly: false });
            next();
        } catch (exception) {
            const detail = {};

            // Check if Joi validation error
            if (exception.isJoi && exception.details) {
                // Delete file from cloud storage if validation fails
                if (req.file && req.file.cloudStorageObject) {
                    try {
                        await bucket.file(req.file.cloudStorageObject).delete();
                    } catch (deleteError) {
                        console.error('Error deleting file from cloud storage:', deleteError);
                    }
                }

                // Map the validation errors to details object
                exception.details.map((error) => {
                    console.log("Validation error:", error);
                    detail[error["path"][0]] = error.message;
                });
            } else {
                // Handle other types of errors
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
