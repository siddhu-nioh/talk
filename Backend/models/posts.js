// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const dataSchema = new Schema(
//       {
//             image: {
//                   type: String,
//                   validate: {
//                         validator: function (value) {
//                               return this.video ? !value : true;
//                         },
//                         message: 'Either image or video should be provided.',
//                   },
//             },
//             video: {
//                   type: String,
//                   validate: {
//                         validator: function (value) {
//                               return this.image ? !value : true;
//                         },
//                         message: 'Either image or video should be provided.',
//                   },
//             },
//             description: {
//                   type: String,
//                   required: true,
//             },
//             owner: {
//                   type: Schema.Types.ObjectId,
//                   ref: 'User',
//             },
//       },
//       { timestamps: true } 
// );
// dataSchema.pre('validate', function (next) {
//       if (!this.image && !this.video) {
//             return next(new Error('Either image or video must be provided.'));
//       }
//       if (this.image && this.video) {
//             return next(new Error('Only one of image or video can be provided.'));
//       }
//       next();
// });


// const Post = mongoose.model('Post', dataSchema);
// module.exports = Post;


///new one for likes an dposts
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Comment schema for nested comments
const commentSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorUsername: String,
  authorProfile: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Main post schema
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
      required: true,
    },
    // Added likes array to store user IDs who liked the post
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    // Added comments array using the comment schema
    comments: [commentSchema]
  },
  { timestamps: true }
);

// Validation middleware to ensure either image or video (but not both) is provided
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