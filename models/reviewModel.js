const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, 'Min ratings value is 1.0'],
      max: [5, 'Max ratings value is 5.0'],
      required: [true, 'review ratings required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user'],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' });
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
