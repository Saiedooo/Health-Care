const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [0, 'Min ratings value is 0'],
      max: [5, 'Max ratings value is 5.0'],
      default: 0,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user'],
    },
    nurse: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a nurse'],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'nurse',
    select: 'firstName lastName',
  });
  next();
});

// reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
//   productId
// ) {
//   const result = await this.aggregate([
//     { $match: { product: productId } },
//     {
//       $group: {
//         _id: 'product',
//         avgRatings: { $avg: '$ratings' },
//         ratingQuantity: { $sum: 1 },
//       },
//     },
//   ]);
//   console.log(result);
//   if (result.length > 0) {
//     await Product.findByIdAndUpdate(productId, {
//       ratingsAverage: result[0].avgRatings,
//       ratingQuantity: result[0].ratingQuantity,
//     });
//   } else {
//     await Product.findByIdAndUpdate(productId, {
//       ratingsAverage: 0,
//       ratingQuantity: 0,
//     });
//   }

//   reviewSchema.post('save', async function () {
//     await this.constructor.calcAverageRatingsAndQuantity(this.product);
//   });
// };

// reviewSchema.post('remove', async function () {
//   await this.constructor.calcAverageRatingsAndQuantity(this.product);
// });

module.exports = mongoose.model('Review', reviewSchema);
