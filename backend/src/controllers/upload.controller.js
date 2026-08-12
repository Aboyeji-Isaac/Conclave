const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const cloudinary = require('../config/cloudinary');

// TODO: use multer (already in package.json) to accept multipart/form-data,
// stream the buffer to cloudinary.uploader.upload_stream, then insert a row
// into `attachments` linked to the message/room.
const uploadFile = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement Cloudinary upload', cloudinaryReady: !!cloudinary }, 201);
});

module.exports = { uploadFile };
