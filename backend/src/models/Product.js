import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    rating : { type : Number, required : true },
    comment : String,
    date : { type : Date },
    reviewerName : String,
    reviewerEmail : String
},{_id : false});

const dimensionsSchema = new mongoose.Schema({
    width : Number,
    height : Number,
    depth : Number
},{_id : false});

const metaSchema = new mongoose.Schema({
    createdAt : { type : Date },
    updatedAt : { type : Date },
    barcode : String,
    qrCode : String
},{_id : false});

const productSchema = new mongoose.Schema({
    externalId : { type : Number , index : true },
    title : { type : String , required : true },
    description : { type : String },
    category : { type : String , required : true },
    price : { type : Number},
    discountPercentage : { type : Number},
    rating : { type : Number},
    stock : { type : Number , required : true , min : 0 , default : 0 },
    tags : [ String ],
    brand : String,
    sku : String,
    weight : { type : Number},
    dimensions : dimensionsSchema,
    warrantyInformation : String,
    shippingInformation : String,
    availabilityStatus : String,
    reviews : [ reviewSchema ],
    returnPolicy : String,
    minimumOrderQuantity : { type : Number, default : 1 },
    meta : metaSchema,
    images : [ String ],
    thumbnail : String,
    createdAt : { type : Date , default : Date.now },
    updatedAt : { type : Date , default : Date.now }
});

productSchema.index({title : 'text', description : 'text', brand : 'text', tags : 'text'});

productSchema.pre('save', function(next){
    this.updatedAt = Date.now();
    next();
});


productSchema.virtual('Average Rating').get(function(){
    if(!this.reviews || this.reviews.length === 0) return this.rating || 0;
    const sum = this.reviews.reduce((total, review) => total + (review.rating || 0), 0);
    return Number((sum / this.reviews.length).toFixed(2));
})

export default mongoose.model('Product', productSchema);