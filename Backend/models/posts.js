const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataSchema = new Schema(
      {
            image: {
                  type: String,
                  validate: {
                        validator: function (value) {
                              return this.video ? !value : true;
                        },
                        message: 'Either image or video should be provided.',
                  },
            },
            video: {
                  type: String,
                  validate: {
                        validator: function (value) {
                              return this.image ? !value : true;
                        },
                        message: 'Either image or video should be provided.',
                  },
            },
            description: {
                  type: String,
                  required: true,
            },
            owner: {
                  type: Schema.Types.ObjectId,
                  ref: 'User',
            },
      },
      { timestamps: true } 
);
dataSchema.pre('validate', function (next) {
      if (!this.image && !this.video) {
            return next(new Error('Either image or video must be provided.'));
      }
      if (this.image && this.video) {
            return next(new Error('Only one of image or video can be provided.'));
      }
      next();
});


const Post = mongoose.model('Post', dataSchema);
module.exports = Post;
